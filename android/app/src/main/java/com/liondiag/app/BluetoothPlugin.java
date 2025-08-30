
package com.liondiag.app;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "BluetoothPlugin",
    permissions = {
        @Permission(strings = {Manifest.permission.BLUETOOTH}, alias = "bluetooth"),
        @Permission(strings = {Manifest.permission.BLUETOOTH_ADMIN}, alias = "bluetoothAdmin"),
        @Permission(strings = {Manifest.permission.BLUETOOTH_SCAN}, alias = "bluetoothScan"),
        @Permission(strings = {Manifest.permission.BLUETOOTH_CONNECT}, alias = "bluetoothConnect"),
        @Permission(strings = {Manifest.permission.ACCESS_FINE_LOCATION}, alias = "location"),
        @Permission(strings = {Manifest.permission.ACCESS_COARSE_LOCATION}, alias = "coarseLocation")
    }
)
public class BluetoothPlugin extends Plugin {
    private static final String TAG = "BluetoothPlugin";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private static final int REQUEST_ENABLE_BT = 1001;
    private static final int REQUEST_PERMISSIONS = 1002;

    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket bluetoothSocket;
    private InputStream inputStream;
    private OutputStream outputStream;
    private List<BluetoothDevice> discoveredDevices = new ArrayList<>();
    private boolean isScanning = false;

    private final BroadcastReceiver bluetoothReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if (device != null && !discoveredDevices.contains(device)) {
                    discoveredDevices.add(device);
                    notifyDeviceFound(device);
                }
            } else if (BluetoothAdapter.ACTION_DISCOVERY_STARTED.equals(action)) {
                notifyListeners("discoveryStarted", new JSObject());
            } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                isScanning = false;
                notifyDiscoveryFinished();
            } else if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                int bondState = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.BOND_NONE);
                notifyBondStateChanged(device, bondState);
            }
        }
    };

    @Override
    public void load() {
        super.load();
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        registerBluetoothReceiver();
    }

    @PluginMethod
    public void checkBluetoothStatus(PluginCall call) {
        JSObject result = new JSObject();
        
        try {
            boolean supported = bluetoothAdapter != null;
            boolean enabled = supported && bluetoothAdapter.isEnabled();
            boolean hasPermissions = checkAllPermissions();
            
            result.put("supported", supported);
            result.put("enabled", enabled);
            result.put("hasPermissions", hasPermissions);
            
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error checking Bluetooth status", e);
            call.reject("Failed to check Bluetooth status: " + e.getMessage());
        }
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (checkAllPermissions()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            result.put("message", "All permissions already granted");
            call.resolve(result);
            return;
        }

        requestPermissionForAliases(getRequiredPermissions(), call, "permissionCallback");
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        boolean granted = checkAllPermissions();
        JSObject result = new JSObject();
        result.put("granted", granted);
        result.put("message", granted ? "Permissions granted" : "Some permissions denied");
        call.resolve(result);
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
            if (hasBluetoothConnectPermission()) {
                Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                startActivityForResult(call, enableBtIntent, "enableBluetoothResult");
            } else {
                call.reject("BLUETOOTH_CONNECT permission required");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error enabling Bluetooth", e);
            call.reject("Failed to enable Bluetooth: " + e.getMessage());
        }
    }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        if (!checkBluetoothReady(call)) return;

        try {
            discoveredDevices.clear();
            
            if (bluetoothAdapter.isDiscovering()) {
                bluetoothAdapter.cancelDiscovery();
            }

            if (hasBluetoothScanPermission()) {
                boolean started = bluetoothAdapter.startDiscovery();
                isScanning = started;
                
                JSObject result = new JSObject();
                result.put("success", started);
                result.put("message", started ? "Discovery started" : "Failed to start discovery");
                call.resolve(result);
            } else {
                call.reject("BLUETOOTH_SCAN permission required");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error starting discovery", e);
            call.reject("Failed to start discovery: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        try {
            if (bluetoothAdapter != null && bluetoothAdapter.isDiscovering()) {
                if (hasBluetoothScanPermission()) {
                    boolean stopped = bluetoothAdapter.cancelDiscovery();
                    isScanning = false;
                    
                    JSObject result = new JSObject();
                    result.put("success", stopped);
                    result.put("message", stopped ? "Discovery stopped" : "Failed to stop discovery");
                    call.resolve(result);
                } else {
                    call.reject("BLUETOOTH_SCAN permission required");
                }
            } else {
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("message", "Discovery not running");
                call.resolve(result);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error stopping discovery", e);
            call.reject("Failed to stop discovery: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getPairedDevices(PluginCall call) {
        if (!checkBluetoothReady(call)) return;

        try {
            if (hasBluetoothConnectPermission()) {
                Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
                JSObject result = createDeviceListResult(new ArrayList<>(pairedDevices));
                call.resolve(result);
            } else {
                call.reject("BLUETOOTH_CONNECT permission required");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting paired devices", e);
            call.reject("Failed to get paired devices: " + e.getMessage());
        }
    }

    @PluginMethod
    public void pairDevice(PluginCall call) {
        String address = call.getString("address");
        if (address == null) {
            call.reject("Device address required");
            return;
        }

        if (!checkBluetoothReady(call)) return;

        try {
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
            
            if (hasBluetoothConnectPermission()) {
                boolean pairingResult = device.createBond();
                
                JSObject result = new JSObject();
                result.put("success", pairingResult);
                result.put("device", device.getName());
                result.put("address", address);
                result.put("connected", false);
                
                call.resolve(result);
            } else {
                call.reject("BLUETOOTH_CONNECT permission required");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error pairing device", e);
            call.reject("Failed to pair device: " + e.getMessage());
        }
    }

    @PluginMethod
    public void connectToDevice(PluginCall call) {
        String address = call.getString("address");
        if (address == null) {
            call.reject("Device address required");
            return;
        }

        if (!checkBluetoothReady(call)) return;

        try {
            // Disconnect existing connection
            disconnect();
            
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
            
            if (hasBluetoothConnectPermission()) {
                // Stop discovery to improve connection reliability
                if (bluetoothAdapter.isDiscovering()) {
                    bluetoothAdapter.cancelDiscovery();
                }
                
                bluetoothSocket = device.createRfcommSocketToServiceRecord(SPP_UUID);
                bluetoothSocket.connect();
                
                inputStream = bluetoothSocket.getInputStream();
                outputStream = bluetoothSocket.getOutputStream();
                
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("device", device.getName());
                result.put("address", address);
                result.put("connected", true);
                
                call.resolve(result);
            } else {
                call.reject("BLUETOOTH_CONNECT permission required");
            }
        } catch (IOException e) {
            Log.e(TAG, "Connection failed", e);
            call.reject("Connection failed: " + e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Error connecting to device", e);
            call.reject("Failed to connect: " + e.getMessage());
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        try {
            disconnect();
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("message", "Disconnected successfully");
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error disconnecting", e);
            call.reject("Failed to disconnect: " + e.getMessage());
        }
    }

    @PluginMethod
    public void isConnected(PluginCall call) {
        boolean connected = bluetoothSocket != null && bluetoothSocket.isConnected();
        JSObject result = new JSObject();
        result.put("success", true);
        result.put("connected", connected);
        
        if (connected && bluetoothSocket.getRemoteDevice() != null) {
            try {
                if (hasBluetoothConnectPermission()) {
                    result.put("device", bluetoothSocket.getRemoteDevice().getName());
                    result.put("address", bluetoothSocket.getRemoteDevice().getAddress());
                }
            } catch (Exception e) {
                Log.w(TAG, "Error getting connected device info", e);
            }
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

        if (bluetoothSocket == null || !bluetoothSocket.isConnected()) {
            call.reject("Not connected to device");
            return;
        }

        try {
            // Send command
            outputStream.write((command + "\r").getBytes());
            outputStream.flush();
            
            // Read response with timeout
            StringBuilder response = new StringBuilder();
            long startTime = System.currentTimeMillis();
            
            while (System.currentTimeMillis() - startTime < timeout) {
                if (inputStream.available() > 0) {
                    byte[] buffer = new byte[1024];
                    int bytes = inputStream.read(buffer);
                    String data = new String(buffer, 0, bytes);
                    response.append(data);
                    
                    // Check for response completion (ELM327 typically ends with '>')
                    if (data.contains(">")) {
                        break;
                    }
                }
                Thread.sleep(50);
            }
            
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("command", command);
            result.put("response", response.toString().trim());
            result.put("timestamp", System.currentTimeMillis());
            
            call.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending command", e);
            call.reject("Failed to send command: " + e.getMessage());
        }
    }

    @PluginMethod
    public void initializeELM327(PluginCall call) {
        if (bluetoothSocket == null || !bluetoothSocket.isConnected()) {
            call.reject("Not connected to device");
            return;
        }

        try {
            StringBuilder responses = new StringBuilder();
            
            // ELM327 initialization commands
            String[] initCommands = {
                "ATZ",      // Reset
                "ATE0",     // Echo off
                "ATL0",     // Linefeeds off
                "ATS0",     // Spaces off
                "ATH1",     // Headers on
                "ATSP0",    // Set protocol to auto
                "0100"      // Test command
            };
            
            for (String cmd : initCommands) {
                Thread.sleep(100); // Wait between commands
                
                outputStream.write((cmd + "\r").getBytes());
                outputStream.flush();
                
                // Read response
                StringBuilder response = new StringBuilder();
                long startTime = System.currentTimeMillis();
                
                while (System.currentTimeMillis() - startTime < 2000) {
                    if (inputStream.available() > 0) {
                        byte[] buffer = new byte[1024];
                        int bytes = inputStream.read(buffer);
                        String data = new String(buffer, 0, bytes);
                        response.append(data);
                        
                        if (data.contains(">")) {
                            break;
                        }
                    }
                    Thread.sleep(50);
                }
                
                responses.append(cmd).append(": ").append(response.toString().trim()).append("\n");
            }
            
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("message", "ELM327 initialized successfully");
            result.put("responses", responses.toString());
            
            call.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Error initializing ELM327", e);
            call.reject("Failed to initialize ELM327: " + e.getMessage());
        }
    }

    // Helper methods
    private void registerBluetoothReceiver() {
        IntentFilter filter = new IntentFilter();
        filter.addAction(BluetoothDevice.ACTION_FOUND);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        filter.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        
        getContext().registerReceiver(bluetoothReceiver, filter);
    }

    private boolean checkBluetoothReady(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth not supported");
            return false;
        }
        
        if (!bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth not enabled");
            return false;
        }
        
        if (!checkAllPermissions()) {
            call.reject("Required permissions not granted");
            return false;
        }
        
        return true;
    }

    private boolean checkAllPermissions() {
        return hasBluetoothPermission() && 
               hasLocationPermission() && 
               hasBluetoothScanPermission() && 
               hasBluetoothConnectPermission();
    }

    private boolean hasBluetoothPermission() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH) == PackageManager.PERMISSION_GRANTED;
    }

    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private boolean hasBluetoothScanPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED;
        }
        return true; // Not required for older versions
    }

    private boolean hasBluetoothConnectPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED;
        }
        return true; // Not required for older versions
    }

    private String[] getRequiredPermissions() {
        List<String> permissions = new ArrayList<>();
        permissions.add("bluetooth");
        permissions.add("bluetoothAdmin");
        permissions.add("location");
        permissions.add("coarseLocation");
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            permissions.add("bluetoothScan");
            permissions.add("bluetoothConnect");
        }
        
        return permissions.toArray(new String[0]);
    }

    private JSObject createDeviceListResult(List<BluetoothDevice> devices) {
        JSObject result = new JSObject();
        List<JSObject> deviceList = new ArrayList<>();
        
        for (BluetoothDevice device : devices) {
            try {
                if (hasBluetoothConnectPermission()) {
                    JSObject deviceObj = new JSObject();
                    deviceObj.put("name", device.getName() != null ? device.getName() : "Unknown Device");
                    deviceObj.put("address", device.getAddress());
                    deviceObj.put("type", device.getType());
                    deviceObj.put("bonded", device.getBondState() == BluetoothDevice.BOND_BONDED);
                    deviceObj.put("compatibility", calculateCompatibility(device.getName()));
                    
                    deviceList.add(deviceObj);
                }
            } catch (Exception e) {
                Log.w(TAG, "Error processing device: " + device.getAddress(), e);
            }
        }
        
        result.put("devices", deviceList);
        result.put("count", deviceList.size());
        return result;
    }

    private double calculateCompatibility(String deviceName) {
        if (deviceName == null) return 0.1;
        
        String name = deviceName.toLowerCase();
        if (name.contains("elm327")) return 0.95;
        if (name.contains("obd") || name.contains("vgate") || name.contains("konnwei")) return 0.85;
        if (name.contains("bluetooth")) return 0.3;
        
        return 0.1;
    }

    private void disconnect() {
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
        } catch (IOException e) {
            Log.e(TAG, "Error closing connections", e);
        }
    }

    private void notifyDeviceFound(BluetoothDevice device) {
        try {
            if (hasBluetoothConnectPermission()) {
                JSObject deviceObj = new JSObject();
                deviceObj.put("name", device.getName() != null ? device.getName() : "Unknown Device");
                deviceObj.put("address", device.getAddress());
                deviceObj.put("type", device.getType());
                deviceObj.put("bonded", device.getBondState() == BluetoothDevice.BOND_BONDED);
                deviceObj.put("compatibility", calculateCompatibility(device.getName()));
                
                notifyListeners("deviceFound", deviceObj);
            }
        } catch (Exception e) {
            Log.w(TAG, "Error notifying device found", e);
        }
    }

    private void notifyDiscoveryFinished() {
        JSObject result = createDeviceListResult(discoveredDevices);
        notifyListeners("discoveryFinished", result);
    }

    private void notifyBondStateChanged(BluetoothDevice device, int bondState) {
        try {
            if (hasBluetoothConnectPermission()) {
                JSObject bondObj = new JSObject();
                String state = bondState == BluetoothDevice.BOND_BONDED ? "bonded" :
                              bondState == BluetoothDevice.BOND_BONDING ? "bonding" : "none";
                bondObj.put("state", state);
                bondObj.put("device", device.getName() != null ? device.getName() : "Unknown Device");
                
                notifyListeners("pairingState", bondObj);
            }
        } catch (Exception e) {
            Log.w(TAG, "Error notifying bond state change", e);
        }
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        try {
            disconnect();
            getContext().unregisterReceiver(bluetoothReceiver);
        } catch (Exception e) {
            Log.e(TAG, "Error in handleOnDestroy", e);
        }
    }
}
