
package com.lovable.liondiag307scan;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.getcapacitor.JSArray;
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
    name = "CustomBluetoothSerial",
    permissions = {
        @Permission(strings = {Manifest.permission.BLUETOOTH}, alias = "bluetooth"),
        @Permission(strings = {Manifest.permission.BLUETOOTH_ADMIN}, alias = "bluetoothAdmin"),
        @Permission(strings = {Manifest.permission.BLUETOOTH_CONNECT}, alias = "bluetoothConnect"),
        @Permission(strings = {Manifest.permission.BLUETOOTH_SCAN}, alias = "bluetoothScan"),
        @Permission(strings = {Manifest.permission.ACCESS_FINE_LOCATION}, alias = "location")
    }
)
public class CustomBluetoothSerial extends Plugin {
    private static final String TAG = "CustomBluetoothSerial";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket bluetoothSocket;
    private InputStream inputStream;
    private OutputStream outputStream;
    private boolean isScanning = false;
    private List<BluetoothDevice> discoveredDevices = new ArrayList<>();
    
    private final BroadcastReceiver discoveryReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if (device != null && !discoveredDevices.contains(device)) {
                    discoveredDevices.add(device);
                    Log.d(TAG, "Device found: " + getDeviceName(device) + " - " + device.getAddress());
                    
                    // Notify web layer of found device
                    JSObject deviceInfo = new JSObject();
                    deviceInfo.put("name", getDeviceName(device));
                    deviceInfo.put("address", device.getAddress());
                    deviceInfo.put("type", device.getType());
                    notifyListeners("deviceFound", deviceInfo);
                }
            } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                isScanning = false;
                Log.d(TAG, "Discovery finished. Found " + discoveredDevices.size() + " devices");
                notifyListeners("scanFinished", new JSObject());
            }
        }
    };

    @Override
    public void load() {
        super.load();
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        
        // Register broadcast receiver for device discovery
        IntentFilter filter = new IntentFilter();
        filter.addAction(BluetoothDevice.ACTION_FOUND);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        getContext().registerReceiver(discoveryReceiver, filter);
        
        Log.d(TAG, "CustomBluetoothSerial plugin loaded");
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            requestPermissionForAliases(
                new String[]{"bluetoothConnect", "bluetoothScan", "location"}, 
                call, 
                "bluetoothPermissionsCallback"
            );
        } else {
            requestPermissionForAliases(
                new String[]{"bluetooth", "bluetoothAdmin", "location"}, 
                call, 
                "bluetoothPermissionsCallback"
            );
        }
    }

    @PermissionCallback
    private void bluetoothPermissionsCallback(PluginCall call) {
        if (hasAllPermissions()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        } else {
            call.reject("Bluetooth permissions not granted");
        }
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        JSObject result = new JSObject();
        if (bluetoothAdapter != null) {
            result.put("enabled", bluetoothAdapter.isEnabled());
        } else {
            result.put("enabled", false);
        }
        call.resolve(result);
    }

    @PluginMethod
    public void startScan(PluginCall call) {
        if (!hasRequiredPermissions()) {
            call.reject("Missing Bluetooth permissions");
            return;
        }

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth not available or not enabled");
            return;
        }

        try {
            discoveredDevices.clear();
            
            // Cancel any ongoing discovery
            if (bluetoothAdapter.isDiscovering()) {
                bluetoothAdapter.cancelDiscovery();
            }
            
            // Start discovery
            boolean started = bluetoothAdapter.startDiscovery();
            if (started) {
                isScanning = true;
                Log.d(TAG, "Bluetooth discovery started");
                
                JSObject result = new JSObject();
                result.put("success", true);
                call.resolve(result);
            } else {
                call.reject("Failed to start Bluetooth discovery");
            }
        } catch (SecurityException e) {
            Log.e(TAG, "Security exception during scan: " + e.getMessage());
            call.reject("Security exception: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopScan(PluginCall call) {
        if (bluetoothAdapter != null && bluetoothAdapter.isDiscovering()) {
            try {
                bluetoothAdapter.cancelDiscovery();
                isScanning = false;
                Log.d(TAG, "Bluetooth discovery stopped");
            } catch (SecurityException e) {
                Log.e(TAG, "Security exception stopping scan: " + e.getMessage());
            }
        }
        
        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }

    @PluginMethod
    public void getPairedDevices(PluginCall call) {
        if (!hasRequiredPermissions()) {
            call.reject("Missing Bluetooth permissions");
            return;
        }

        JSArray devices = new JSArray();
        
        if (bluetoothAdapter != null) {
            try {
                Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
                for (BluetoothDevice device : pairedDevices) {
                    JSObject deviceInfo = new JSObject();
                    deviceInfo.put("name", getDeviceName(device));
                    deviceInfo.put("address", device.getAddress());
                    deviceInfo.put("type", device.getType());
                    deviceInfo.put("bonded", true);
                    devices.put(deviceInfo);
                }
            } catch (SecurityException e) {
                Log.e(TAG, "Security exception getting paired devices: " + e.getMessage());
                call.reject("Security exception: " + e.getMessage());
                return;
            }
        }
        
        JSObject result = new JSObject();
        result.put("devices", devices);
        call.resolve(result);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String address = call.getString("address");
        if (address == null) {
            call.reject("Device address is required");
            return;
        }

        if (!hasRequiredPermissions()) {
            call.reject("Missing Bluetooth permissions");
            return;
        }

        try {
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
            bluetoothSocket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            
            // Cancel discovery before connecting
            if (bluetoothAdapter.isDiscovering()) {
                bluetoothAdapter.cancelDiscovery();
            }
            
            bluetoothSocket.connect();
            inputStream = bluetoothSocket.getInputStream();
            outputStream = bluetoothSocket.getOutputStream();
            
            Log.d(TAG, "Connected to device: " + address);
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
        } catch (IOException | SecurityException e) {
            Log.e(TAG, "Error connecting to device: " + e.getMessage());
            call.reject("Connection failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
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
            
            Log.d(TAG, "Disconnected from Bluetooth device");
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
        } catch (IOException e) {
            Log.e(TAG, "Error disconnecting: " + e.getMessage());
            call.reject("Disconnect failed: " + e.getMessage());
        }
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
            outputStream.write((data + "\r").getBytes());
            outputStream.flush();
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
        } catch (IOException e) {
            Log.e(TAG, "Error writing data: " + e.getMessage());
            call.reject("Write failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void read(PluginCall call) {
        if (inputStream == null) {
            call.reject("Not connected to any device");
            return;
        }

        try {
            StringBuilder response = new StringBuilder();
            byte[] buffer = new byte[1024];
            int bytesRead = inputStream.read(buffer);
            
            if (bytesRead > 0) {
                response.append(new String(buffer, 0, bytesRead));
            }
            
            JSObject result = new JSObject();
            result.put("data", response.toString());
            call.resolve(result);
            
        } catch (IOException e) {
            Log.e(TAG, "Error reading data: " + e.getMessage());
            call.reject("Read failed: " + e.getMessage());
        }
    }

    private boolean hasRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return hasPermission("bluetoothConnect") && hasPermission("bluetoothScan");
        } else {
            return hasPermission("bluetooth") && hasPermission("bluetoothAdmin");
        }
    }

    private boolean hasAllPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return hasPermission("bluetoothConnect") && 
                   hasPermission("bluetoothScan") && 
                   hasPermission("location");
        } else {
            return hasPermission("bluetooth") && 
                   hasPermission("bluetoothAdmin") && 
                   hasPermission("location");
        }
    }

    private String getDeviceName(BluetoothDevice device) {
        try {
            if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED) {
                String name = device.getName();
                return name != null ? name : "Unknown Device";
            }
        } catch (SecurityException e) {
            Log.e(TAG, "Permission denied getting device name: " + e.getMessage());
        }
        return "Unknown Device";
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        try {
            if (getContext() != null) {
                getContext().unregisterReceiver(discoveryReceiver);
            }
        } catch (IllegalArgumentException e) {
            // Receiver not registered, ignore
        }
        
        // Clean up connections
        try {
            if (inputStream != null) inputStream.close();
            if (outputStream != null) outputStream.close();
            if (bluetoothSocket != null) bluetoothSocket.close();
        } catch (IOException e) {
            Log.e(TAG, "Error closing connections: " + e.getMessage());
        }
    }
}
