
package com.lovable.liondiag307scan;

import android.Manifest;
import android.annotation.SuppressLint;
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
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(
    name = "CustomBluetoothSerial",
    permissions = {
        @Permission(strings = {Manifest.permission.BLUETOOTH}, alias = "bluetooth"),
        @Permission(strings = {Manifest.permission.BLUETOOTH_ADMIN}, alias = "bluetoothAdmin"),
        @Permission(strings = {Manifest.permission.BLUETOOTH_CONNECT}, alias = "bluetoothConnect"),
        @Permission(strings = {Manifest.permission.BLUETOOTH_SCAN}, alias = "bluetoothScan"),
        @Permission(strings = {Manifest.permission.ACCESS_COARSE_LOCATION}, alias = "coarseLocation"),
        @Permission(strings = {Manifest.permission.ACCESS_FINE_LOCATION}, alias = "fineLocation")
    }
)
public class CustomBluetoothSerial extends Plugin {
    
    private static final String TAG = "CustomBluetoothSerial";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private static final int REQUEST_ENABLE_BT = 1001;
    private static final int REQUEST_PERMISSIONS = 1002;
    
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket bluetoothSocket;
    private InputStream inputStream;
    private OutputStream outputStream;
    private BroadcastReceiver discoveryReceiver;
    private boolean isReceiverRegistered = false;
    private ExecutorService executorService;
    
    @Override
    public void load() {
        super.load();
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        executorService = Executors.newCachedThreadPool();
        Log.d(TAG, "CustomBluetoothSerial plugin loaded");
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        Log.d(TAG, "Requesting Bluetooth permissions");
        
        if (hasAllPermissions()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        
        String[] permissions = getRequiredPermissions();
        requestPermissionForAliases(permissions, call, "permissionCallback");
    }
    
    private String[] getRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return new String[]{
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.ACCESS_FINE_LOCATION
            };
        } else {
            return new String[]{
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            };
        }
    }
    
    private boolean hasAllPermissions() {
        String[] permissions = getRequiredPermissions();
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(getContext(), permission) 
                != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        JSObject result = new JSObject();
        boolean enabled = bluetoothAdapter != null && bluetoothAdapter.isEnabled();
        result.put("enabled", enabled);
        Log.d(TAG, "Bluetooth enabled: " + enabled);
        call.resolve(result);
    }

    @PluginMethod
    public void requestEnable(PluginCall call) {
        Log.d(TAG, "Requesting to enable Bluetooth");
        
        if (bluetoothAdapter == null) {
            JSObject result = new JSObject();
            result.put("enabled", false);
            result.put("error", "Bluetooth not supported");
            call.resolve(result);
            return;
        }

        if (bluetoothAdapter.isEnabled()) {
            JSObject result = new JSObject();
            result.put("enabled", true);
            call.resolve(result);
            return;
        }

        // For Android 12+, we need BLUETOOTH_CONNECT permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) 
                != PackageManager.PERMISSION_GRANTED) {
                JSObject result = new JSObject();
                result.put("enabled", false);
                result.put("error", "BLUETOOTH_CONNECT permission required");
                call.resolve(result);
                return;
            }
        }

        try {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(call, enableBtIntent, "enableBluetoothResult");
        } catch (Exception e) {
            Log.e(TAG, "Failed to request Bluetooth enable", e);
            JSObject result = new JSObject();
            result.put("enabled", false);
            result.put("error", e.getMessage());
            call.resolve(result);
        }
    }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        Log.d(TAG, "Starting Bluetooth discovery");
        
        if (!hasAllPermissions()) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "Missing permissions");
            call.resolve(result);
            return;
        }

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "Bluetooth not enabled");
            call.resolve(result);
            return;
        }

        try {
            registerDiscoveryReceiver();
            
            if (bluetoothAdapter.isDiscovering()) {
                bluetoothAdapter.cancelDiscovery();
            }
            
            boolean started = bluetoothAdapter.startDiscovery();
            JSObject result = new JSObject();
            result.put("success", started);
            
            if (started) {
                Log.d(TAG, "Bluetooth discovery started successfully");
            } else {
                Log.w(TAG, "Failed to start Bluetooth discovery");
            }
            
            call.resolve(result);
        } catch (SecurityException e) {
            Log.e(TAG, "Security exception during discovery", e);
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "Permission denied: " + e.getMessage());
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error starting discovery", e);
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", e.getMessage());
            call.resolve(result);
        }
    }

    @SuppressLint("MissingPermission")
    private void registerDiscoveryReceiver() {
        if (isReceiverRegistered || bluetoothAdapter == null) {
            return;
        }

        discoveryReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                Log.d(TAG, "Broadcast received: " + action);

                if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                    BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                    if (device != null) {
                        JSObject deviceInfo = new JSObject();
                        deviceInfo.put("address", device.getAddress());
                        deviceInfo.put("name", device.getName() != null ? device.getName() : "Unknown");
                        
                        short rssi = intent.getShortExtra(BluetoothDevice.EXTRA_RSSI, Short.MIN_VALUE);
                        if (rssi != Short.MIN_VALUE) {
                            deviceInfo.put("rssi", rssi);
                        }
                        
                        Log.d(TAG, "Device found: " + device.getName() + " (" + device.getAddress() + ")");
                        notifyListeners("deviceFound", deviceInfo);
                    }
                } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                    Log.d(TAG, "Discovery finished");
                    notifyListeners("discoveryFinished", new JSObject());
                } else if (BluetoothAdapter.ACTION_DISCOVERY_STARTED.equals(action)) {
                    Log.d(TAG, "Discovery started");
                    notifyListeners("discoveryStarted", new JSObject());
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(BluetoothDevice.ACTION_FOUND);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED);
        
        getContext().registerReceiver(discoveryReceiver, filter);
        isReceiverRegistered = true;
        Log.d(TAG, "Discovery receiver registered");
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        Log.d(TAG, "Stopping Bluetooth discovery");
        
        try {
            boolean stopped = true;
            if (bluetoothAdapter != null && bluetoothAdapter.isDiscovering()) {
                stopped = bluetoothAdapter.cancelDiscovery();
            }
            
            JSObject result = new JSObject();
            result.put("success", stopped);
            call.resolve(result);
        } catch (SecurityException e) {
            Log.e(TAG, "Security exception stopping discovery", e);
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", e.getMessage());
            call.resolve(result);
        }
    }

    @PluginMethod
    public void getBondedDevices(PluginCall call) {
        Log.d(TAG, "Getting bonded devices");
        
        if (!hasAllPermissions()) {
            JSObject result = new JSObject();
            result.put("devices", new JSObject[0]);
            call.resolve(result);
            return;
        }

        try {
            Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();
            JSObject[] devices = new JSObject[bondedDevices.size()];
            
            int i = 0;
            for (BluetoothDevice device : bondedDevices) {
                JSObject deviceInfo = new JSObject();
                deviceInfo.put("address", device.getAddress());
                deviceInfo.put("name", device.getName() != null ? device.getName() : "Unknown");
                devices[i++] = deviceInfo;
            }
            
            JSObject result = new JSObject();
            result.put("devices", devices);
            call.resolve(result);
            
            Log.d(TAG, "Found " + bondedDevices.size() + " bonded devices");
        } catch (SecurityException e) {
            Log.e(TAG, "Security exception getting bonded devices", e);
            JSObject result = new JSObject();
            result.put("devices", new JSObject[0]);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String address = call.getString("address");
        String uuidString = call.getString("uuid", SPP_UUID.toString());
        
        Log.d(TAG, "Connecting to device: " + address);
        
        if (address == null) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "Device address is required");
            call.resolve(result);
            return;
        }

        executorService.execute(() -> connectToDevice(call, address, uuidString));
    }

    @SuppressLint("MissingPermission")
    private void connectToDevice(PluginCall call, String address, String uuidString) {
        try {
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
            UUID uuid = UUID.fromString(uuidString);
            
            // Close existing connection
            disconnect();
            
            // Stop discovery to improve connection performance
            if (bluetoothAdapter.isDiscovering()) {
                bluetoothAdapter.cancelDiscovery();
            }
            
            // Create socket
            bluetoothSocket = device.createRfcommSocketToServiceRecord(uuid);
            
            try {
                bluetoothSocket.connect();
            } catch (IOException e) {
                Log.w(TAG, "Standard connection failed, trying fallback method");
                bluetoothSocket.close();
                
                // Fallback method using reflection
                Method m = device.getClass().getMethod("createRfcommSocket", new Class[]{int.class});
                bluetoothSocket = (BluetoothSocket) m.invoke(device, 1);
                bluetoothSocket.connect();
            }
            
            inputStream = bluetoothSocket.getInputStream();
            outputStream = bluetoothSocket.getOutputStream();
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
            Log.d(TAG, "Successfully connected to " + address);
            
        } catch (Exception e) {
            Log.e(TAG, "Connection failed", e);
            disconnect();
            
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", e.getMessage());
            call.resolve(result);
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        disconnect();
        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
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
            Log.d(TAG, "Disconnected from device");
        } catch (IOException e) {
            Log.e(TAG, "Error during disconnect", e);
        }
    }

    @PluginMethod
    public void write(PluginCall call) {
        String data = call.getString("data");
        
        if (data == null || outputStream == null) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "No data or not connected");
            call.resolve(result);
            return;
        }

        executorService.execute(() -> {
            try {
                outputStream.write(data.getBytes());
                outputStream.flush();
                
                JSObject result = new JSObject();
                result.put("success", true);
                call.resolve(result);
                
                Log.d(TAG, "Data written: " + data);
            } catch (IOException e) {
                Log.e(TAG, "Write failed", e);
                JSObject result = new JSObject();
                result.put("success", false);
                result.put("error", e.getMessage());
                call.resolve(result);
            }
        });
    }

    @PluginMethod
    public void read(PluginCall call) {
        if (inputStream == null) {
            JSObject result = new JSObject();
            result.put("data", "");
            result.put("error", "Not connected");
            call.resolve(result);
            return;
        }

        executorService.execute(() -> {
            try {
                byte[] buffer = new byte[1024];
                StringBuilder response = new StringBuilder();
                long startTime = System.currentTimeMillis();
                
                while (System.currentTimeMillis() - startTime < 3000) {
                    if (inputStream.available() > 0) {
                        int bytes = inputStream.read(buffer);
                        response.append(new String(buffer, 0, bytes));
                        
                        if (response.toString().contains(">") || response.toString().contains("\r")) {
                            break;
                        }
                    }
                    Thread.sleep(50);
                }
                
                JSObject result = new JSObject();
                result.put("data", response.toString());
                call.resolve(result);
                
                Log.d(TAG, "Data read: " + response.toString());
            } catch (Exception e) {
                Log.e(TAG, "Read failed", e);
                JSObject result = new JSObject();
                result.put("data", "");
                result.put("error", e.getMessage());
                call.resolve(result);
            }
        });
    }

    @PluginMethod
    public void isConnected(PluginCall call) {
        boolean connected = bluetoothSocket != null && bluetoothSocket.isConnected();
        JSObject result = new JSObject();
        result.put("connected", connected);
        call.resolve(result);
    }

    @Override
    protected void handleOnDestroy() {
        cleanup();
        super.handleOnDestroy();
    }

    private void cleanup() {
        disconnect();
        
        if (isReceiverRegistered && discoveryReceiver != null) {
            try {
                getContext().unregisterReceiver(discoveryReceiver);
                isReceiverRegistered = false;
            } catch (Exception e) {
                Log.e(TAG, "Error unregistering receiver", e);
            }
        }
        
        if (executorService != null && !executorService.isShutdown()) {
            executorService.shutdown();
        }
        
        Log.d(TAG, "CustomBluetoothSerial cleaned up");
    }
}
