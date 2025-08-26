
package com.lovable.liondiag307scan.bt;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class PermissionHelper {
    public static final int REQ_BT = 9001;

    public static String[] neededPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return new String[]{
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT
            };
        } else {
            return new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION
            };
        }
    }

    public static boolean hasAll(Activity activity) {
        String[] permissions = neededPermissions();
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(activity, permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    public static void request(Activity activity) {
        ActivityCompat.requestPermissions(activity, neededPermissions(), REQ_BT);
    }
}
