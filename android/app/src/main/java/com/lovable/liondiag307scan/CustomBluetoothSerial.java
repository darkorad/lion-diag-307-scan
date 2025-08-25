
package com.lovable.liondiag307scan;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Set;
import org.json.JSONArray;

@CapacitorPlugin(name = "CustomBluetoothSerial")
public class CustomBluetoothSerial extends Plugin {

    private BluetoothAdapter bluetoothAdapter;

    @Override
    public void load() {
        BluetoothManager bluetoothManager = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        if (bluetoothManager != null) {
            bluetoothAdapter = bluetoothManager.getAdapter();
        }
    }

    @PluginMethod
    public void list(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available.");
            return;
        }

        if (checkBluetoothPermission()) {
            JSONArray deviceList = new JSONArray();
            Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();

            for (BluetoothDevice device : bondedDevices) {
                try {
                    JSObject deviceJs = new JSObject();
                    deviceJs.put("name", device.getName());
                    deviceJs.put("address", device.getAddress());
                    deviceJs.put("id", device.getAddress());
                    if (device.getBluetoothClass() != null) {
                        deviceJs.put("class", device.getBluetoothClass().getDeviceClass());
                    } else {
                        deviceJs.put("class", 0);
                    }
                    deviceList.put(deviceJs);
                } catch (Exception e) {
                    // Log the exception or handle it
                }
            }
            JSObject result = new JSObject();
            result.put("devices", deviceList);
            call.resolve(result);
        } else {
            call.reject("Bluetooth permission not granted");
        }
    }

    private boolean checkBluetoothPermission() {
        return ActivityCompat.checkSelfPermission(getContext(), android.Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED;
    }
}
