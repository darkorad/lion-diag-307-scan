package com.lovable.liondiag307scan;

import com.getcapacitor.BridgeActivity;
import com.lovable.liondiag307scan.bt.PermissionHelper;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register our enhanced Bluetooth plugin
        registerPlugin(LionDiagBluetoothPlugin.class);

        // Keep existing plugins for backward compatibility
        registerPlugin(CustomBluetoothSerial.class);
        registerPlugin(CapBluetoothPlugin.class);

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
                android.util.Log.d(\"MainActivity\", \"Bluetooth permissions granted\");
            } else {
                android.util.Log.w(\"MainActivity\", \"Some Bluetooth permissions were denied\");
            }
        }
    }
}
