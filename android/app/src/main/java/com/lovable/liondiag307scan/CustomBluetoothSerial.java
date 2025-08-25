
package com.lovable.liondiag307scan;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;
import org.json.JSONArray;
import org.json.JSONException;

@CapacitorPlugin(name = "CustomBluetoothSerial")
public class CustomBluetoothSerial extends Plugin {

    private static final String TAG = "CustomBluetoothSerial";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket bluetoothSocket;
    private InputStream inputStream;
    private OutputStream outputStream;
    private BroadcastReceiver discoveryReceiver;
    private boolean isReceiverRegistered = false;

    @Override
    public void load() {
        BluetoothManager bluetoothManager = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        if (bluetoothManager != null) {
            bluetoothAdapter = bluetoothManager.getAdapter();
        }
        Log.d(TAG, "CustomBluetoothSerial plugin loaded");
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        JSObject result = new JSObject();
        result.put("value", bluetoothAdapter.isEnabled());
        call.resolve(result);
    }

    @PluginMethod
    public void getAdapterState(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        JSObject result = new JSObject();
        int state = bluetoothAdapter.getState();
        String stateString;
        
        switch (state) {
            case BluetoothAdapter.STATE_OFF:
                stateString = "STATE_OFF";
                break;
            case BluetoothAdapter.STATE_ON:
                stateString = "STATE_ON";
                break;
            case BluetoothAdapter.STATE_TURNING_OFF:
                stateString = "STATE_TURNING_OFF";
                break;
            case BluetoothAdapter.STATE_TURNING_ON:
                stateString = "STATE_TURNING_ON";
                break;
            default:
                stateString = "UNKNOWN";
        }
        
        result.put("state", stateString);
        call.resolve(result);
    }

    @PluginMethod
    public void requestEnable(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        if (!bluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            getActivity().startActivityForResult(enableBtIntent, 1);
            
            // For now, return success - in a real implementation, you'd wait for the result
            JSObject result = new JSObject();
            result.put("value", true);
            call.resolve(result);
        } else {
            JSObject result = new JSObject();
            result.put("value", true);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void enable(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        JSObject result = new JSObject();
        
        if (bluetoothAdapter.isEnabled()) {
            result.put("value", true);
        } else {
            // Note: bluetoothAdapter.enable() is deprecated and requires system-level permissions
            // In modern Android, apps should use ACTION_REQUEST_ENABLE intent instead
            result.put("value", false);
        }
        
        call.resolve(result);
    }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        if (!checkBluetoothPermissions()) {
            call.reject("Bluetooth permissions not granted");
            return;
        }

        JSObject result = new JSObject();
        
        if (bluetoothAdapter.isDiscovering()) {
            bluetoothAdapter.cancelDiscovery();
        }
        
        boolean started = bluetoothAdapter.startDiscovery();
        result.put("success", started);
        
        if (started) {
            Log.d(TAG, "Bluetooth discovery started");
            notifyListeners("discoveryStarted", new JSObject());
        }
        
        call.resolve(result);
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        JSObject result = new JSObject();
        
        if (bluetoothAdapter.isDiscovering()) {
            boolean stopped = bluetoothAdapter.cancelDiscovery();
            result.put("success", stopped);
        } else {
            result.put("success", true);
        }
        
        call.resolve(result);
    }

    @PluginMethod
    public void isDiscovering(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        JSObject result = new JSObject();
        result.put("discovering", bluetoothAdapter.isDiscovering());
        call.resolve(result);
    }

    @PluginMethod
    public void getBondedDevices(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        if (!checkBluetoothPermissions()) {
            call.reject("Bluetooth permissions not granted");
            return;
        }

        JSONArray deviceList = new JSONArray();
        Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();

        for (BluetoothDevice device : bondedDevices) {
            try {
                JSObject deviceJs = new JSObject();
                deviceJs.put("name", device.getName() != null ? device.getName() : "Unknown Device");
                deviceJs.put("address", device.getAddress());
                deviceJs.put("id", device.getAddress());
                if (device.getBluetoothClass() != null) {
                    deviceJs.put("class", device.getBluetoothClass().getDeviceClass());
                } else {
                    deviceJs.put("class", 0);
                }
                deviceList.put(deviceJs);
            } catch (SecurityException e) {
                Log.e(TAG, "Security exception getting device info", e);
            }
        }
        
        JSObject result = new JSObject();
        result.put("devices", deviceList);
        call.resolve(result);
    }

    @PluginMethod
    public void registerReceiver(PluginCall call) {
        if (isReceiverRegistered) {
            call.resolve();
            return;
        }

        discoveryReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                
                if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                    BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                    if (device != null) {
                        try {
                            JSObject deviceInfo = new JSObject();
                            deviceInfo.put("name", device.getName() != null ? device.getName() : "Unknown Device");
                            deviceInfo.put("address", device.getAddress());
                            
                            short rssi = intent.getShortExtra(BluetoothDevice.EXTRA_RSSI, Short.MIN_VALUE);
                            if (rssi != Short.MIN_VALUE) {
                                deviceInfo.put("rssi", rssi);
                            }
                            
                            notifyListeners("deviceFound", deviceInfo);
                            
                        } catch (SecurityException e) {
                            Log.e(TAG, "Security exception in device found receiver", e);
                        }
                    }
                } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                    notifyListeners("discoveryFinished", new JSObject());
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(BluetoothDevice.ACTION_FOUND);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED);
        
        getContext().registerReceiver(discoveryReceiver, filter);
        isReceiverRegistered = true;
        
        Log.d(TAG, "Bluetooth discovery receiver registered");
        call.resolve();
    }

    @PluginMethod
    public void unregisterReceiver(PluginCall call) {
        if (isReceiverRegistered && discoveryReceiver != null) {
            getContext().unregisterReceiver(discoveryReceiver);
            isReceiverRegistered = false;
            discoveryReceiver = null;
            Log.d(TAG, "Bluetooth discovery receiver unregistered");
        }
        call.resolve();
    }

    @PluginMethod
    public void createBond(PluginCall call) {
        String address = call.getString("address");
        if (address == null) {
            call.reject("Device address is required");
            return;
        }

        if (!checkBluetoothPermissions()) {
            call.reject("Bluetooth permissions not granted");
            return;
        }

        try {
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
            boolean result = device.createBond();
            
            JSObject response = new JSObject();
            response.put("success", result);
            call.resolve(response);
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to create bond with device: " + address, e);
            call.reject("Failed to pair with device: " + e.getMessage());
        }
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String address = call.getString("address");
        String uuidString = call.getString("uuid", SPP_UUID.toString());
        
        if (address == null) {
            call.reject("Device address is required");
            return;
        }

        if (!checkBluetoothPermissions()) {
            call.reject("Bluetooth permissions not granted");
            return;
        }

        try {
            // Close existing connection if any
            if (bluetoothSocket != null && bluetoothSocket.isConnected()) {
                bluetoothSocket.close();
            }

            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
            UUID uuid = UUID.fromString(uuidString);
            
            bluetoothSocket = device.createRfcommSocketToServiceRecord(uuid);
            
            // Cancel discovery to improve connection performance
            if (bluetoothAdapter.isDiscovering()) {
                bluetoothAdapter.cancelDiscovery();
            }
            
            bluetoothSocket.connect();
            
            inputStream = bluetoothSocket.getInputStream();
            outputStream = bluetoothSocket.getOutputStream();
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
            Log.d(TAG, "Successfully connected to device: " + address);
            
        } catch (IOException e) {
            Log.e(TAG, "Failed to connect to device: " + address, e);
            JSObject result = new JSObject();
            result.put("success", false);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        JSObject result = new JSObject();
        
        try {
            if (inputStream != null) {
                inputStream.close();
                inputStream = null;
            }
            if (outputStream != null) {
                outputStream.close();
                outputStream = null;
            }
            if (bluetoothSocket != null) {
                bluetoothSocket.close();
                bluetoothSocket = null;
            }
            
            result.put("success", true);
            Log.d(TAG, "Disconnected from Bluetooth device");
            
        } catch (IOException e) {
            Log.e(TAG, "Error disconnecting from device", e);
            result.put("success", false);
        }
        
        call.resolve(result);
    }

    @PluginMethod
    public void isConnected(PluginCall call) {
        JSObject result = new JSObject();
        boolean connected = bluetoothSocket != null && bluetoothSocket.isConnected();
        result.put("connected", connected);
        call.resolve(result);
    }

    @PluginMethod
    public void write(PluginCall call) {
        String data = call.getString("data");
        if (data == null) {
            call.reject("Data is required");
            return;
        }

        if (outputStream == null) {
            call.reject("Not connected to any device");
            return;
        }

        try {
            outputStream.write(data.getBytes());
            outputStream.flush();
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
        } catch (IOException e) {
            Log.e(TAG, "Failed to write data", e);
            call.reject("Failed to write data: " + e.getMessage());
        }
    }

    @PluginMethod
    public void read(PluginCall call) {
        if (inputStream == null) {
            call.reject("Not connected to any device");
            return;
        }

        try {
            byte[] buffer = new byte[1024];
            int bytesRead = inputStream.read(buffer);
            
            String data = "";
            if (bytesRead > 0) {
                data = new String(buffer, 0, bytesRead);
            }
            
            JSObject result = new JSObject();
            result.put("data", data);
            call.resolve(result);
            
        } catch (IOException e) {
            Log.e(TAG, "Failed to read data", e);
            call.reject("Failed to read data: " + e.getMessage());
        }
    }

    @PluginMethod
    public void list(PluginCall call) {
        // This method is kept for backward compatibility
        getBondedDevices(call);
    }

    private boolean checkBluetoothPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED &&
                   ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED;
        } else {
            return ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH) == PackageManager.PERMISSION_GRANTED &&
                   ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        }
    }
}
