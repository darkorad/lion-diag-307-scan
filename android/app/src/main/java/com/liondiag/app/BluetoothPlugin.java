
package com.liondiag.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "BluetoothPlugin",
    permissions = {
        @Permission(strings = { Manifest.permission.BLUETOOTH }, alias = "bluetooth"),
        @Permission(strings = { Manifest.permission.BLUETOOTH_ADMIN }, alias = "bluetoothAdmin"),
        @Permission(strings = { Manifest.permission.ACCESS_FINE_LOCATION }, alias = "location"),
        @Permission(strings = { Manifest.permission.BLUETOOTH_SCAN }, alias = "bluetoothScan"),
        @Permission(strings = { Manifest.permission.BLUETOOTH_CONNECT }, alias = "bluetoothConnect"),
        @Permission(strings = { Manifest.permission.BLUETOOTH_ADVERTISE }, alias = "bluetoothAdvertise")
    }
)
public class BluetoothPlugin extends Plugin {
    
    private static final String TAG = "BluetoothPlugin";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");
    private static final int REQUEST_ENABLE_BT = 1;
    private static final int PERMISSION_REQUEST_CODE = 2;
    
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket bluetoothSocket;
    private InputStream inputStream;
    private OutputStream outputStream;
    private Handler mainHandler;
    private SharedPreferences preferences;
    
    // Device discovery
    private Set<BluetoothDevice> discoveredDevices = new HashSet<>();
    private boolean isScanning = false;
    
    // Connection state
    private BluetoothDevice connectedDevice;
    private boolean isConnected = false;
    
    // Auto-reconnect
    private static final int MAX_RECONNECT_ATTEMPTS = 3;
    private int reconnectAttempts = 0;
    private Handler reconnectHandler;
    private static final int RECONNECT_DELAY_MS = 5000;

    // Pairing
    private PluginCall pairingCall;
    
    @Override
    public void load() {
        super.load();
        mainHandler = new Handler(Looper.getMainLooper());
        reconnectHandler = new Handler(Looper.getMainLooper());
        preferences = getContext().getSharedPreferences("bluetooth_prefs", Context.MODE_PRIVATE);
        
        BluetoothManager bluetoothManager = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        if (bluetoothManager != null) {
            bluetoothAdapter = bluetoothManager.getAdapter();
        }
        
        // Register broadcast receiver for device discovery and connection state
        IntentFilter filter = new IntentFilter();
        filter.addAction(BluetoothDevice.ACTION_FOUND);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        filter.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
        
        getContext().registerReceiver(bluetoothReceiver, filter);
        
        Log.d(TAG, "BluetoothPlugin loaded successfully");
    }
    
    private final BroadcastReceiver bluetoothReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if (device != null) {
                    discoveredDevices.add(device);
                    notifyDeviceFound(device);
                }
            } else if (BluetoothAdapter.ACTION_DISCOVERY_STARTED.equals(action)) {
                isScanning = true;
                notifyListeners("discoveryStarted", new JSObject());
            } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                isScanning = false;
                JSObject result = new JSObject();
                result.put("devices", getDevicesArray());
                result.put("count", discoveredDevices.size());
                notifyListeners("discoveryFinished", result);
            } else if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
                handleBondStateChange(intent);
            } else if (BluetoothAdapter.ACTION_STATE_CHANGED.equals(action)) {
                int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);
                handleBluetoothStateChange(state);
            }
        }
    };
    
    @PluginMethod
    public void checkBluetoothStatus(PluginCall call) {
        JSObject result = new JSObject();
        
        if (bluetoothAdapter == null) {
            result.put("supported", false);
            result.put("enabled", false);
            result.put("hasPermissions", false);
        } else {
            result.put("supported", true);
            result.put("enabled", bluetoothAdapter.isEnabled());
            result.put("hasPermissions", hasAllPermissions());
        }
        
        call.resolve(result);
    }
    
    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (hasAllPermissions()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            result.put("message", "All permissions already granted");
            call.resolve(result);
            return;
        }
        
        List<String> permissions = new ArrayList<>();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+ permissions
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.BLUETOOTH_SCAN);
            }
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.BLUETOOTH_CONNECT);
            }
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_ADVERTISE) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.BLUETOOTH_ADVERTISE);
            }
        } else {
            // Legacy permissions
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.BLUETOOTH);
            }
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_ADMIN) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.BLUETOOTH_ADMIN);
            }
        }
        
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        
        if (permissions.isEmpty()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            result.put("message", "All permissions already granted");
            call.resolve(result);
        } else {
            saveCall(call);
            ActivityCompat.requestPermissions(
                getActivity(),
                permissions.toArray(new String[0]),
                PERMISSION_REQUEST_CODE
            );
        }
    }
    
    @PluginMethod
    public void enableBluetooth(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth not supported");
            return;
        }
        
        if (bluetoothAdapter.isEnabled()) {
            JSObject result = new JSObject();
            result.put("requested", false);
            result.put("message", "Bluetooth already enabled");
            call.resolve(result);
            return;
        }
        
        try {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            getActivity().startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
            
            JSObject result = new JSObject();
            result.put("requested", true);
            result.put("message", "Bluetooth enable requested");
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to request Bluetooth enable", e);
        }
    }
    
    @SuppressLint("MissingPermission")
    @PluginMethod
    public void startDiscovery(PluginCall call) {
        if (!hasRequiredPermissions()) {
            call.reject("Missing required permissions");
            return;
        }
        
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth not available or not enabled");
            return;
        }
        
        if (isScanning) {
            bluetoothAdapter.cancelDiscovery();
        }
        
        discoveredDevices.clear();
        
        boolean started = bluetoothAdapter.startDiscovery();
        if (started) {
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("message", "Discovery started");
            call.resolve(result);
        } else {
            call.reject("Failed to start discovery");
        }
    }
    
    @SuppressLint("MissingPermission")
    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        if (bluetoothAdapter != null && isScanning) {
            bluetoothAdapter.cancelDiscovery();
        }
        
        JSObject result = new JSObject();
        result.put("success", true);
        result.put("message", "Discovery stopped");
        call.resolve(result);
    }
    
    @SuppressLint("MissingPermission")
    @PluginMethod
    public void getPairedDevices(PluginCall call) {
        if (!hasRequiredPermissions()) {
            call.reject("Missing required permissions");
            return;
        }
        
        JSObject result = new JSObject();
        
        if (bluetoothAdapter == null) {
            result.put("devices", new JSArray());
            result.put("count", 0);
            call.resolve(result);
            return;
        }
        
        Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
        JSArray devicesArray = new JSArray();
        
        for (BluetoothDevice device : pairedDevices) {
            JSObject deviceObj = createDeviceObject(device, true);
            devicesArray.put(deviceObj);
        }
        
        result.put("devices", devicesArray);
        result.put("count", pairedDevices.size());
        call.resolve(result);
    }
    
    @SuppressLint("MissingPermission")
    @PluginMethod
    public void pairDevice(PluginCall call) {
        String address = call.getString("address");
        if (address == null) {
            call.reject("Device address required");
            return;
        }

        if (!hasRequiredPermissions()) {
            call.reject("Missing required permissions");
            return;
        }

        BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
        if (device == null) {
            call.reject("Device not found");
            return;
        }

        if (device.getBondState() == BluetoothDevice.BOND_BONDED) {
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("message", "Device already paired");
            call.resolve(result);
            return;
        }

        pairingCall = call;
        boolean success = device.createBond();
        if (!success) {
            pairingCall = null;
            call.reject("Failed to start pairing process");
        }
    }
    
    @SuppressLint("MissingPermission")
    @PluginMethod
    public void connectToDevice(PluginCall call) {
        String address = call.getString("address");
        if (address == null) {
            call.reject("Device address required");
            return;
        }

        if (!hasRequiredPermissions()) {
            call.reject("Missing required permissions");
            return;
        }

        if (isConnected) {
            disconnect();
        }

        BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
        final Handler timeoutHandler = new Handler(Looper.getMainLooper());
        final Runnable timeoutRunnable = () -> {
            if (bluetoothSocket != null && !bluetoothSocket.isConnected()) {
                try {
                    bluetoothSocket.close();
                } catch (IOException e) {
                    Log.e(TAG, "Failed to close socket on timeout", e);
                }
            }
        };

        new Thread(() -> {
            try {
                Log.d(TAG, "Connecting to device: " + device.getAddress());
                bluetoothSocket = device.createRfcommSocketToServiceRecord(SPP_UUID);
                
                timeoutHandler.postDelayed(timeoutRunnable, 10000); // 10 second timeout
                bluetoothSocket.connect();
                timeoutHandler.removeCallbacks(timeoutRunnable);

                inputStream = bluetoothSocket.getInputStream();
                outputStream = bluetoothSocket.getOutputStream();

                connectedDevice = device;
                isConnected = true;
                reconnectAttempts = 0;
                
                saveLastConnectedDevice(device);

                mainHandler.post(() -> {
                    JSObject result = new JSObject();
                    result.put("success", true);
                    result.put("device", device.getName() != null ? device.getName() : "Unknown");
                    result.put("address", device.getAddress());
                    result.put("connected", true);
                    call.resolve(result);
                    notifyListeners("connected", result);
                });

            } catch (IOException e) {
                timeoutHandler.removeCallbacks(timeoutRunnable);
                Log.e(TAG, "Connection failed", e);
                mainHandler.post(() -> {
                    call.reject("Connection failed: " + e.getMessage());
                });
            }
        }).start();
    }
    
    @PluginMethod
    public void disconnect(PluginCall call) {
        disconnect();
        
        JSObject result = new JSObject();
        result.put("success", true);
        result.put("message", "Disconnected");
        call.resolve(result);
    }
    
    @PluginMethod
    public void isConnected(PluginCall call) {
        JSObject result = new JSObject();
        result.put("connected", isConnected);
        
        if (connectedDevice != null) {
            result.put("device", connectedDevice.getName());
            result.put("address", connectedDevice.getAddress());
        }
        
        call.resolve(result);
    }
    
    @PluginMethod
    public void sendCommand(PluginCall call) {
        String command = call.getString("command");
        Integer timeout = call.getInt("timeout", 5000);

        if (command == null) {
            call.reject("Command required");
            return;
        }

        if (!isConnected || outputStream == null || inputStream == null) {
            call.reject("Not connected to any device");
            return;
        }

        new Thread(() -> {
            try {
                Log.d(TAG, "Sending command: " + command);
                outputStream.write((command + "\r").getBytes());
                outputStream.flush();

                StringBuilder response = new StringBuilder();
                long startTime = System.currentTimeMillis();
                char lastChar = ' ';

                while (System.currentTimeMillis() - startTime < timeout) {
                    if (inputStream.available() > 0) {
                        int bytes = inputStream.read();
                        if (bytes == -1) break;

                        lastChar = (char) bytes;
                        response.append(lastChar);
                        
                        if (lastChar == '>') { // ELM327 prompt character
                            break;
                        }
                    }
                    Thread.sleep(20);
                }

                String responseStr = response.toString().trim();
                Log.d(TAG, "Command response: " + responseStr);

                mainHandler.post(() -> {
                    JSObject result = new JSObject();
                    result.put("success", true);
                    result.put("command", command);
                    result.put("response", responseStr);
                    call.resolve(result);
                });

            } catch (Exception e) {
                Log.e(TAG, "Command failed", e);
                mainHandler.post(() -> {
                    call.reject("Command failed: " + e.getMessage());
                });
            }
        }).start();
    }
    
    @PluginMethod
    public void initializeELM327(PluginCall call) {
        if (!isConnected) {
            call.reject("Not connected to device");
            return;
        }
        
        new Thread(() -> {
            try {
                StringBuilder responses = new StringBuilder();
                
                // ELM327 initialization commands
                String[] initCommands = {
                    "ATZ",      // Reset
                    "ATE0",     // Echo off
                    "ATL0",     // Linefeeds off
                    "ATS0",     // Spaces off
                    "ATH1",     // Headers on
                    "ATSP0",    // Auto protocol
                    "0100"      // Test command
                };
                
                for (String cmd : initCommands) {
                    Log.d(TAG, "ELM327 Init: " + cmd);
                    
                    outputStream.write((cmd + "\r\n").getBytes());
                    outputStream.flush();
                    
                    Thread.sleep(500);
                    
                    if (inputStream.available() > 0) {
                        byte[] buffer = new byte[1024];
                        int bytes = inputStream.read(buffer);
                        String response = new String(buffer, 0, bytes);
                        responses.append(cmd).append(": ").append(response.trim()).append("\n");
                        Log.d(TAG, "ELM327 Response: " + response.trim());
                    }
                }
                
                mainHandler.post(() -> {
                    JSObject result = new JSObject();
                    result.put("success", true);
                    result.put("message", "ELM327 initialized");
                    result.put("responses", responses.toString());
                    call.resolve(result);
                });
                
            } catch (Exception e) {
                Log.e(TAG, "ELM327 initialization failed", e);
                mainHandler.post(() -> {
                    call.reject("ELM327 initialization failed: " + e.getMessage());
                });
            }
        }).start();
    }
    
    @PluginMethod
    public void attemptAutoReconnect(PluginCall call) {
        String lastDeviceAddress = getLastConnectedDeviceAddress();

        if (lastDeviceAddress == null) {
            call.reject("No previous device found");
            return;
        }

        if (isConnected) {
            call.resolve(new JSObject().put("success", true).put("message", "Already connected"));
            return;
        }

        reconnectAttempts = 0;
        tryAutoReconnect(lastDeviceAddress, call);
    }

    private void tryAutoReconnect(String address, PluginCall originalCall) {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            if (originalCall != null) {
                originalCall.reject("Auto-reconnect failed after " + MAX_RECONNECT_ATTEMPTS + " attempts");
            }
            return;
        }

        reconnectAttempts++;
        Log.d(TAG, "Auto-reconnect attempt " + reconnectAttempts + " to " + address);

        PluginCall reconnectCall = new PluginCall("auto-reconnect", "connectToDevice", new JSObject());
        reconnectCall.getData().put("address", address);

        connectToDevice(new PluginCall(reconnectCall.getCallbackId(), reconnectCall.getMethodName(), reconnectCall.getData()) {
            @Override
            public void resolve(JSObject data) {
                if (originalCall != null) {
                    originalCall.resolve(data);
                }
            }

            @Override
            public void reject(String message, String code, Exception e) {
                reconnectHandler.postDelayed(() -> tryAutoReconnect(address, originalCall), RECONNECT_DELAY_MS);
            }
        });
    }
    
    // Helper methods
    private boolean hasAllPermissions() {
        return hasRequiredPermissions() && hasLocationPermission();
    }
    
    private boolean hasRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED &&
                   ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED;
        } else {
            return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH) == PackageManager.PERMISSION_GRANTED &&
                   ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_ADMIN) == PackageManager.PERMISSION_GRANTED;
        }
    }
    
    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }
    
    @SuppressLint("MissingPermission")
    private JSObject createDeviceObject(BluetoothDevice device, boolean isPaired) {
        JSObject deviceObj = new JSObject();
        deviceObj.put("name", device.getName() != null ? device.getName() : "Unknown Device");
        deviceObj.put("address", device.getAddress());
        deviceObj.put("type", device.getType());
        deviceObj.put("bonded", isPaired || device.getBondState() == BluetoothDevice.BOND_BONDED);
        
        // Calculate compatibility score for OBD2 devices
        String name = device.getName() != null ? device.getName().toLowerCase() : "";
        int compatibility = calculateCompatibilityScore(name);
        deviceObj.put("compatibility", compatibility);
        
        return deviceObj;
    }
    
    private int calculateCompatibilityScore(String deviceName) {
        if (deviceName.contains("elm327") || deviceName.contains("elm 327")) return 95;
        if (deviceName.contains("obd") || deviceName.contains("obdii")) return 90;
        if (deviceName.contains("vgate") || deviceName.contains("viecar")) return 85;
        if (deviceName.contains("konnwei") || deviceName.contains("autel")) return 80;
        if (deviceName.contains("bluetooth") && deviceName.contains("car")) return 70;
        if (deviceName.contains("scan") || deviceName.contains("diag")) return 65;
        return 30; // Default for unknown devices
    }
    
    private JSArray getDevicesArray() {
        JSArray devicesArray = new JSArray();
        for (BluetoothDevice device : discoveredDevices) {
            JSObject deviceObj = createDeviceObject(device, false);
            devicesArray.put(deviceObj);
        }
        return devicesArray;
    }
    
    @SuppressLint("MissingPermission")
    private void notifyDeviceFound(BluetoothDevice device) {
        JSObject deviceObj = createDeviceObject(device, false);
        notifyListeners("deviceFound", deviceObj);
    }
    
    @SuppressLint("MissingPermission")
    private void handleBondStateChange(Intent intent) {
        BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
        int bondState = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.BOND_NONE);
        int previousBondState = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE, BluetoothDevice.BOND_NONE);

        JSObject state = new JSObject();
        state.put("device", device.getName() != null ? device.getName() : "Unknown");
        state.put("address", device.getAddress());

        if (pairingCall != null && pairingCall.getData().getString("address").equals(device.getAddress())) {
            if (bondState == BluetoothDevice.BOND_BONDED) {
                state.put("success", true);
                state.put("message", "Pairing successful");
                pairingCall.resolve(state);
                pairingCall = null;
            } else if (bondState == BluetoothDevice.BOND_NONE && previousBondState == BluetoothDevice.BOND_BONDING) {
                pairingCall.reject("Pairing failed");
                pairingCall = null;
            }
        }
        
        String stateStr;
        switch (bondState) {
            case BluetoothDevice.BOND_BONDING:
                stateStr = "bonding";
                break;
            case BluetoothDevice.BOND_BONDED:
                stateStr = "bonded";
                break;
            default:
                stateStr = "none";
                break;
        }
        state.put("state", stateStr);
        notifyListeners("pairingState", state);
    }
    
    private void handleBluetoothStateChange(int state) {
        if (state == BluetoothAdapter.STATE_OFF && isConnected) {
            disconnect();
            notifyListeners("disconnected", new JSObject().put("reason", "bluetooth_disabled"));
        }
    }
    
    private void disconnect() {
        try {
            isConnected = false;
            connectedDevice = null;
            
            if (bluetoothSocket != null) {
                bluetoothSocket.close();
                bluetoothSocket = null;
            }
            
            if (inputStream != null) {
                inputStream.close();
                inputStream = null;
            }
            
            if (outputStream != null) {
                outputStream.close();
                outputStream = null;
            }
            
            JSObject result = new JSObject();
            result.put("device", "");
            result.put("connected", false);
            notifyListeners("disconnected", result);
            
        } catch (IOException e) {
            Log.e(TAG, "Error during disconnect", e);
        }
    }
    
    @SuppressLint("MissingPermission")
    private void saveLastConnectedDevice(BluetoothDevice device) {
        SharedPreferences.Editor editor = preferences.edit();
        editor.putString("last_device_address", device.getAddress());
        editor.putString("last_device_name", device.getName());
        editor.putLong("last_connected_time", System.currentTimeMillis());
        editor.apply();
        
        Log.d(TAG, "Saved last connected device: " + device.getName());
    }
    
    private String getLastConnectedDeviceAddress() {
        return preferences.getString("last_device_address", null);
    }
    
    @Override
    protected void handleOnDestroy() {
        try {
            if (bluetoothReceiver != null) {
                getContext().unregisterReceiver(bluetoothReceiver);
            }
            disconnect();
        } catch (Exception e) {
            Log.e(TAG, "Error in onDestroy", e);
        }
        super.handleOnDestroy();
    }
}
