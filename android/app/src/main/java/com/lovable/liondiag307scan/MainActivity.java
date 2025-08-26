
package com.lovable.liondiag307scan;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.lovable.liondiag307scan.bt.PermissionHelper;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register our custom Bluetooth plugin
        registerPlugin(CustomBluetoothSerial.class);
        
        // Check and request Bluetooth permissions
        if (!PermissionHelper.hasAll(this)) {
            PermissionHelper.request(this);
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == PermissionHelper.REQ_BT) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            
            if (allGranted) {
                // Permissions granted, Bluetooth functionality should work now
                android.util.Log.d("MainActivity", "Bluetooth permissions granted");
            } else {
                // Some permissions denied
                android.util.Log.w("MainActivity", "Some Bluetooth permissions were denied");
            }
        }
    }
}
