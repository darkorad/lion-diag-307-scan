
package com.lovable.liondiag307scan;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.lovable.liondiag307scan.bt.BluetoothClassicManager;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "CapBluetooth")
public class CapBluetoothPlugin extends Plugin {

    private BluetoothClassicManager classic;
    private BluetoothSocket currentSocket;
    private InputStream inputStream;
    private OutputStream outputStream;

    @Override
    public void load() {
        classic = new BluetoothClassicManager(getActivity());
    }

    @PluginMethod
    public void ensureEnabled(PluginCall call) {
        boolean enabled = classic.ensureEnabled(null);
        JSObject ret = new JSObject();
        ret.put("enabled", enabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            classic.startDiscovery(new BluetoothClassicManager.DiscoveryListener() {
                @Override
                public void onDeviceFound(BluetoothDevice device, Short rssi) {
                    JSObject data = new JSObject();
                    data.put("name", device.getName() != null ? device.getName() : "Unknown Device");
                    data.put("address", device.getAddress());
                    data.put("bonded", device.getBondState() == BluetoothDevice.BOND_BONDED);
                    data.put("rssi", rssi != null ? rssi.intValue() : 0);
                    notifyListeners("deviceFound", data, true);
                }

                @Override
                public void onDiscoveryFinished() {
                    notifyListeners("discoveryFinished", new JSObject(), true);
                }

                @Override
                public void onError(String msg) {
                    JSObject error = new JSObject();
                    error.put("message", msg);
                    notifyListeners("error", error, true);
                }
            });
            call.resolve();
        });
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        classic.stopDiscovery();
        call.resolve();
    }

    @PluginMethod
    public void pair(PluginCall call) {
        String address = call.getString("address");
        if (address == null || address.isEmpty()) {
            call.reject("address required");
            return;
        }

        BluetoothDevice device = BluetoothAdapter.getDefaultAdapter().getRemoteDevice(address);
        classic.pair(device, new BluetoothClassicManager.PairingListener() {
            @Override
            public void onBonding() {
                JSObject state = new JSObject();
                state.put("state", "bonding");
                notifyListeners("pairing", state, true);
            }

            @Override
            public void onBonded() {
                JSObject state = new JSObject();
                state.put("state", "bonded");
                notifyListeners("pairing", state, true);
                call.resolve();
            }

            @Override
            public void onUnbonded() {
                JSObject state = new JSObject();
                state.put("state", "none");
                notifyListeners("pairing", state, true);
            }

            @Override
            public void onError(String msg) {
                call.reject(msg);
            }
        });
    }

    @PluginMethod
    public void connectSpp(PluginCall call) {
        String address = call.getString("address");
        if (address == null || address.isEmpty()) {
            call.reject("address required");
            return;
        }

        BluetoothDevice device = BluetoothAdapter.getDefaultAdapter().getRemoteDevice(address);
        classic.connectSpp(device, new BluetoothClassicManager.ConnectionListener() {
            @Override
            public void onConnected(BluetoothSocket socket) {
                currentSocket = socket;
                try {
                    inputStream = socket.getInputStream();
                    outputStream = socket.getOutputStream();
                    JSObject result = new JSObject();
                    result.put("address", address);
                    notifyListeners("connected", result, true);
                    call.resolve();
                } catch (IOException e) {
                    call.reject("Failed to get socket streams: " + e.getMessage());
                }
            }

            @Override
            public void onDisconnected() {
                currentSocket = null;
                inputStream = null;
                outputStream = null;
                JSObject result = new JSObject();
                result.put("address", address);
                notifyListeners("disconnected", result, true);
            }

            @Override
            public void onError(String msg) {
                call.reject(msg);
            }
        });
    }

    @PluginMethod
    public void sendCommand(PluginCall call) {
        String command = call.getString("command");
        if (command == null || command.isEmpty()) {
            call.reject("command required");
            return;
        }

        if (currentSocket == null || outputStream == null || inputStream == null) {
            call.reject("Not connected to device");
            return;
        }

        new Thread(() -> {
            try {
                // Send command with \r line ending
                String cmdLine = command.trim() + "\r";
                byte[] cmdBytes = cmdLine.getBytes(StandardCharsets.US_ASCII);
                outputStream.write(cmdBytes);
                outputStream.flush();

                // Read response until '>' prompt
                byte[] buffer = new byte(4096);
                StringBuilder response = new StringBuilder();
                
                long startTime = System.currentTimeMillis();
                long timeout = 5000; // 5 second timeout
                
                while (!response.toString().contains(">")) {
                    if (System.currentTimeMillis() - startTime > timeout) {
                        break;
                    }
                    
                    if (inputStream.available() > 0) {
                        int bytesRead = inputStream.read(buffer);
                        if (bytesRead > 0) {
                            response.append(new String(buffer, 0, bytesRead, StandardCharsets.US_ASCII));
                        }
                    } else {
                        Thread.sleep(50); // Small delay to prevent busy waiting
                    }
                }

                JSObject result = new JSObject();
                result.put("response", response.toString());
                call.resolve(result);

            } catch (Exception e) {
                call.reject("Command failed: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        try {
            classic.close();
            if (currentSocket != null) {
                currentSocket.close();
                currentSocket = null;
            }
            inputStream = null;
            outputStream = null;
            call.resolve();
        } catch (Exception e) {
            call.reject("Disconnect failed: " + e.getMessage());
        }
    }
}
