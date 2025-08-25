
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
import androidx.core.content.ContextCompat;

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

@CapacitorPlugin(name = "CustomBluetoothSerial")
public class CustomBluetoothSerial extends Plugin {

    private static final String TAG = "CustomBluetoothSerial";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket bluetoothSocket;
    private InputStream inputStream;
    private OutputStream outputStream;
    private boolean isConnected = false;
    private boolean isDiscovering = false;

    private BroadcastReceiver bluetoothReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if (device != null) {
                    JSObject deviceObj = new JSObject();
                    
                    if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED) {
                        deviceObj.put("name", device.getName() != null ? device.getName() : "Unknown Device");
                    } else {
                        deviceObj.put("name", "Unknown Device");
                    }
                    
                    deviceObj.put("address", device.getAddress());
                    
                    short rssi = intent.getShortExtra(BluetoothDevice.EXTRA_RSSI, Short.MIN_VALUE);
                    if (rssi != Short.MIN_VALUE) {
                        deviceObj.put("rssi", rssi);
                    }
                    
                    notifyListeners("deviceFound", deviceObj);
                }
            } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                isDiscovering = false;
                notifyListeners("discoveryFinished", new JSObject());
            } else if (BluetoothAdapter.ACTION_DISCOVERY_STARTED.equals(action)) {
                isDiscovering = true;
                notifyListeners("discoveryStarted", new JSObject());
            }
        }
    };

    @Override
    public void load() {
        super.load();
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        
        // Register broadcast receiver
        IntentFilter filter = new IntentFilter();
        filter.addAction(BluetoothDevice.ACTION_FOUND);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED);
        getContext().registerReceiver(bluetoothReceiver, filter);
        
        Log.d(TAG, "CustomBluetoothSerial plugin loaded");
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        Log.d(TAG, "Requesting Bluetooth permissions");
        
        String[] permissions;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            permissions = new String[] {
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            };
        } else {
            permissions = new String[] {
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            };
        }
        
        requestPermissionForAliases(permissions, call, "permissionCallback");
    }

    @PluginMethod
    public void permissionCallback(PluginCall call) {
        boolean granted = true;
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED &&
                     ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED;
        } else {
            granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH) == PackageManager.PERMISSION_GRANTED &&
                     ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_ADMIN) == PackageManager.PERMISSION_GRANTED;
        }
        
        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        JSObject result = new JSObject();
        boolean enabled = bluetoothAdapter != null && bluetoothAdapter.isEnabled();
        result.put("enabled", enabled);
        call.resolve(result);
        Log.d(TAG, "Bluetooth enabled: " + enabled);
    }

    @PluginMethod
    public void requestEnable(PluginCall call) {
        Log.d(TAG, "Requesting to enable Bluetooth");
        
        if (bluetoothAdapter == null) {
            JSObject result = new JSObject();
            result.put("enabled", false);
            call.resolve(result);
            return;
        }

        if (bluetoothAdapter.isEnabled()) {
            JSObject result = new JSObject();
            result.put("enabled", true);
            call.resolve(result);
            return;
        }

        // Request user to enable Bluetooth
        Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        startActivityForResult(call, enableBtIntent, "enableResult");
    }

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        Log.d(TAG, "Starting Bluetooth discovery");
        
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            JSObject result = new JSObject();
            result.put("success", false);
            call.resolve(result);
            return;
        }

        // Check permissions
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
                JSObject result = new JSObject();
                result.put("success", false);
                call.resolve(result);
                return;
            }
        }

        if (bluetoothAdapter.isDiscovering()) {
            bluetoothAdapter.cancelDiscovery();
        }

        boolean started = bluetoothAdapter.startDiscovery();
        JSObject result = new JSObject();
        result.put("success", started);
        call.resolve(result);
        
        Log.d(TAG, "Discovery started: " + started);
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        JSObject result = new JSObject();
        
        if (bluetoothAdapter != null && bluetoothAdapter.isDiscovering()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED) {
                    bluetoothAdapter.cancelDiscovery();
                    result.put("success", true);
                } else {
                    result.put("success", false);
                }
            } else {
                bluetoothAdapter.cancelDiscovery();
                result.put("success", true);
            }
        } else {
            result.put("success", true);
        }
        
        isDiscovering = false;
        call.resolve(result);
        Log.d(TAG, "Discovery stopped");
    }

    @PluginMethod
    public void getBondedDevices(PluginCall call) {
        Log.d(TAG, "Getting bonded devices");
        
        JSObject result = new JSObject();
        
        if (bluetoothAdapter == null) {
            result.put("devices", new JSObject[0]);
            call.resolve(result);
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                result.put("devices", new JSObject[0]);
                call.resolve(result);
                return;
            }
        }

        Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();
        JSObject[] devices = new JSObject[bondedDevices.size()];
        
        int i = 0;
        for (BluetoothDevice device : bondedDevices) {
            JSObject deviceObj = new JSObject();
            deviceObj.put("name", device.getName() != null ? device.getName() : "Unknown Device");
            deviceObj.put("address", device.getAddress());
            devices[i++] = deviceObj;
        }
        
        result.put("devices", devices);
        call.resolve(result);
        
        Log.d(TAG, "Found " + bondedDevices.size() + " bonded devices");
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String address = call.getString("address");
        
        if (address == null) {
            call.reject("Address is required");
            return;
        }

        Log.d(TAG, "Connecting to device: " + address);
        
        try {
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    call.reject("Bluetooth connect permission not granted");
                    return;
                }
            }
            
            bluetoothSocket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            bluetoothSocket.connect();
            
            inputStream = bluetoothSocket.getInputStream();
            outputStream = bluetoothSocket.getOutputStream();
            isConnected = true;
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
            Log.d(TAG, "Connected successfully to " + address);
            
        } catch (IOException e) {
            Log.e(TAG, "Connection failed: " + e.getMessage());
            call.reject("Connection failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        Log.d(TAG, "Disconnecting device");
        
        try {
            if (bluetoothSocket != null && bluetoothSocket.isConnected()) {
                bluetoothSocket.close();
            }
            if (inputStream != null) {
                inputStream.close();
            }
            if (outputStream != null) {
                outputStream.close();
            }
            isConnected = false;
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
        } catch (IOException e) {
            Log.e(TAG, "Disconnect error: " + e.getMessage());
            call.reject("Disconnect failed");
        }
    }

    @PluginMethod
    public void write(PluginCall call) {
        String data = call.getString("data");
        
        if (data == null || !isConnected || outputStream == null) {
            call.reject("Not connected or no data");
            return;
        }

        try {
            outputStream.write(data.getBytes());
            outputStream.flush();
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
        } catch (IOException e) {
            Log.e(TAG, "Write error: " + e.getMessage());
            call.reject("Write failed");
        }
    }

    @PluginMethod
    public void read(PluginCall call) {
        if (!isConnected || inputStream == null) {
            call.reject("Not connected");
            return;
        }

        try {
            byte[] buffer = new byte[1024];
            int bytes = inputStream.read(buffer);
            
            String data = new String(buffer, 0, bytes);
            
            JSObject result = new JSObject();
            result.put("data", data);
            call.resolve(result);
            
        } catch (IOException e) {
            Log.e(TAG, "Read error: " + e.getMessage());
            call.reject("Read failed");
        }
    }

    @PluginMethod
    public void isConnected(PluginCall call) {
        JSObject result = new JSObject();
        result.put("connected", isConnected && bluetoothSocket != null && bluetoothSocket.isConnected());
        call.resolve(result);
    }

    @Override
    protected void handleOnDestroy() {
        try {
            if (bluetoothReceiver != null) {
                getContext().unregisterReceiver(bluetoothReceiver);
            }
            if (bluetoothSocket != null && bluetoothSocket.isConnected()) {
                bluetoothSocket.close();
            }
        } catch (Exception e) {
            Log.e(TAG, "Cleanup error: " + e.getMessage());
        }
        super.handleOnDestroy();
    }
}
