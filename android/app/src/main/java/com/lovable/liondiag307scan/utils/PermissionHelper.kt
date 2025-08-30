
package com.lovable.liondiag307scan.utils

import android.Manifest
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

object PermissionHelper {

    private const val REQUEST_CODE_PERMISSIONS = 101

    // Permissions required for Bluetooth + Location
    private val permissions = mutableListOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION
    ).apply {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            add(Manifest.permission.BLUETOOTH_SCAN)
            add(Manifest.permission.BLUETOOTH_CONNECT)
            add(Manifest.permission.BLUETOOTH_ADVERTISE)
        }
    }.toTypedArray()

    /**
     * Check if all permissions are already granted
     */
    fun hasAllPermissions(activity: Activity): Boolean {
        return permissions.all {
            ContextCompat.checkSelfPermission(activity, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    /**
     * Request all missing permissions
     */
    fun requestPermissions(activity: Activity) {
        ActivityCompat.requestPermissions(activity, permissions, REQUEST_CODE_PERMISSIONS)
    }

    /**
     * Handle permission results
     */
    fun handlePermissionsResult(
        requestCode: Int,
        grantResults: IntArray,
        onGranted: () -> Unit,
        onDenied: () -> Unit
    ) {
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                onGranted()
            } else {
                onDenied()
            }
        }
    }

    /**
     * Check if Bluetooth is ON
     */
    fun isBluetoothEnabled(): Boolean {
        val adapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
        return adapter?.isEnabled == true
    }

    /**
     * Get missing permissions
     */
    fun getMissingPermissions(activity: Activity): List<String> {
        return permissions.filter {
            ContextCompat.checkSelfPermission(activity, it) != PackageManager.PERMISSION_GRANTED
        }
    }

    /**
     * Check if we should show rationale for any permission
     */
    fun shouldShowRationale(activity: Activity): Boolean {
        return permissions.any {
            ActivityCompat.shouldShowRequestPermissionRationale(activity, it)
        }
    }
}
