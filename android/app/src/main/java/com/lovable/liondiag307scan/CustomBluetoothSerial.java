package com.lovable.liondiag307scan;

import android.bluetooth.BluetoothDevice;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.e_is.capacitor_bluetooth_serial.CapacitorBluetoothSerial;
import java.util.Set;
import org.json.JSONArray;

@CapacitorPlugin(name = "BluetoothSerial")
public class CustomBluetoothSerial extends CapacitorBluetoothSerial {

    @PluginMethod
    public void list(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available.");
            return;
        }

        if (checkBluetoothPermission("android.permission.BLUETOOTH_CONNECT")) {
            JSONArray deviceList = new JSONArray();
            Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();

            for (BluetoothDevice device : bondedDevices) {
                try {
                    JSObject deviceJs = new JSObject();
                    deviceJs.put("name", device.getName());
                    deviceJs.put("address", device.getAddress());
                    deviceJs.put("id", device.getAddress());
                    deviceJs.put("class", device.getBluetoothClass().getDeviceClass());
                    deviceList.put(deviceJs);
                } catch (Exception e) {
                    // Log the exception or handle it
                }
            }
            JSObject result = new JSObject();
            result.put("devices", deviceList);
            call.resolve(result);
        } else {
            requestBluetoothPermission("android.permission.BLUETOOTH_CONNECT", 1);
            call.reject("Bluetooth permission not granted");
        }
    }
}
