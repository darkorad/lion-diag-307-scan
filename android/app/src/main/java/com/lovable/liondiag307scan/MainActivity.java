
package com.lovable.liondiag307scan;

import android.os.Bundle;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import com.lovable.liondiag307scan.utils.PermissionHelper;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register our enhanced Bluetooth plugin
        registerPlugin(LionDiagBluetoothPlugin.class);

        // Keep existing plugins for backward compatibility
        registerPlugin(CustomBluetoothSerial.class);
        registerPlugin(CapBluetoothPlugin.class);

        // Check and request Bluetooth permissions using the new helper
        if (!PermissionHelper.INSTANCE.hasAllPermissions(this)) {
            PermissionHelper.INSTANCE.requestPermissions(this);
        } else {
            onPermissionsGranted();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        PermissionHelper.INSTANCE.handlePermissionsResult(
            requestCode,
            grantResults,
            this::onPermissionsGranted,
            this::onPermissionsDenied
        );
    }

    private void onPermissionsGranted() {
        if (!PermissionHelper.INSTANCE.isBluetoothEnabled()) {
            android.util.Log.w("MainActivity", "Bluetooth is not enabled");
            // Note: Bluetooth enable request will be handled by the plugin when needed
        } else {
            android.util.Log.d("MainActivity", "All permissions granted and Bluetooth is enabled");
        }
    }

    private void onPermissionsDenied() {
        android.util.Log.w("MainActivity", "Some Bluetooth permissions were denied");
        // The app can still function with limited capabilities
        // Individual plugins will handle permission requests as needed
    }
}
