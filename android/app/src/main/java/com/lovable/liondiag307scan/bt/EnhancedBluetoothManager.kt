package com.lovable.liondiag307scan.bt

import android.Manifest
import android.app.Activity
import android.bluetooth.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.io.IOException
import java.util.*
import java.util.concurrent.ConcurrentHashMap

/**
 * Enhanced Bluetooth Manager for reliable OBD2 connections
 */
class EnhancedBluetoothManager(private val activity: Activity) {
    
    companion object {
        private const val TAG = "EnhancedBluetoothManager"
        private val SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
    }
    
    private val bluetoothManager = activity.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothAdapter = bluetoothManager.adapter
    
    private var discoveryListener: BluetoothDiscoveryListener? = null
    private var pairingListener: BluetoothPairingListener? = null
    private var connectionListener: BluetoothConnectionListener? = null
    
    private val discoveredDevices = ConcurrentHashMap<String, BluetoothDevice>()
    private var currentSocket: BluetoothSocket? = null
    private var currentDevice: BluetoothDevice? = null
    private var isConnected = false
    
    private val bluetoothReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                BluetoothDevice.ACTION_FOUND -> {
                    val device: BluetoothDevice? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    }
                    
                    device?.let {
                        val rssi = intent.getShortExtra(BluetoothDevice.EXTRA_RSSI, Short.MIN_VALUE).toInt()
                        discoveredDevices[it.address] = it
                        discoveryListener?.onDeviceFound(it, rssi)
                    }
                }
                
                BluetoothAdapter.ACTION_DISCOVERY_STARTED -> {
                    discoveryListener?.onDiscoveryStarted()
                }
                
                BluetoothAdapter.ACTION_DISCOVERY_FINISHED -> {
                    discoveryListener?.onDiscoveryFinished(discoveredDevices.values.toSet())
                }
                
                BluetoothDevice.ACTION_BOND_STATE_CHANGED -> {
                    val device: BluetoothDevice? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    }
                    
                    device?.let {
                        when (it.bondState) {
                            BluetoothDevice.BOND_BONDING -> {
                                pairingListener?.onPairingStarted(it)
                            }
                            BluetoothDevice.BOND_BONDED -> {
                                pairingListener?.onPairingSuccess(it)
                            }
                            BluetoothDevice.BOND_NONE -> {
                                pairingListener?.onPairingFailed(it, "Pairing cancelled or failed")
                            }
                            else -> {
                                // Handle other bond states if needed
                            }
                        }
                    }
                }
            }
        }
    }
    
    fun isBluetoothSupported(): Boolean {
        return bluetoothAdapter != null
    }
    
    fun isBluetoothEnabled(): Boolean {
        return bluetoothAdapter?.isEnabled == true
    }
    
    fun requestEnableBluetooth(): Boolean {
        return try {
            if (!hasAllRequiredPermissions()) {
                Log.w(TAG, "Missing Bluetooth permissions")
                false
            } else {
                val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
                activity.startActivityForResult(enableBtIntent, 1)
                true
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception requesting Bluetooth enable", e)
            false
        }
    }
    
    fun hasAllRequiredPermissions(): Boolean {
        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        } else {
            arrayOf(
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        }
        
        return permissions.all { permission ->
            ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED
        }
    }
    
    fun requestAllPermissions(): Array<String> {
        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        } else {
            arrayOf(
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        }
        
        val permissionsNeeded = permissions.filter { permission ->
            ContextCompat.checkSelfPermission(activity, permission) != PackageManager.PERMISSION_GRANTED
        }.toTypedArray()
        
        if (permissionsNeeded.isNotEmpty()) {
            ActivityCompat.requestPermissions(activity, permissionsNeeded, 1)
        }
        
        return permissionsNeeded
    }
    
    fun startDiscovery(listener: BluetoothDiscoveryListener): Boolean {
        if (!hasAllRequiredPermissions()) {
            listener.onDiscoveryError("Missing required permissions")
            return false
        }
        
        if (!isBluetoothEnabled()) {
            listener.onDiscoveryError("Bluetooth not enabled")
            return false
        }
        
        try {
            this.discoveryListener = listener
            discoveredDevices.clear()
            
            // Register receiver
            val filter = IntentFilter().apply {
                addAction(BluetoothDevice.ACTION_FOUND)
                addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED)
                addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)
            }
            activity.registerReceiver(bluetoothReceiver, filter)
            
            // Cancel any ongoing discovery
            if (bluetoothAdapter?.isDiscovering == true) {
                bluetoothAdapter.cancelDiscovery()
            }
            
            return bluetoothAdapter?.startDiscovery() == true
            
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception during discovery", e)
            listener.onDiscoveryError("Permission denied: ${e.message}")
            return false
        } catch (e: Exception) {
            Log.e(TAG, "Error starting discovery", e)
            listener.onDiscoveryError("Discovery failed: ${e.message}")
            return false
        }
    }
    
    fun stopDiscovery() {
        try {
            if (bluetoothAdapter?.isDiscovering == true) {
                bluetoothAdapter.cancelDiscovery()
            }
            
            try {
                activity.unregisterReceiver(bluetoothReceiver)
            } catch (e: IllegalArgumentException) {
                // Receiver not registered, ignore
            }
            
            discoveryListener = null
            
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception stopping discovery", e)
        }
    }
    
    fun getPairedDevices(): Set<BluetoothDevice> {
        return try {
            if (hasAllRequiredPermissions()) {
                bluetoothAdapter?.bondedDevices ?: emptySet()
            } else {
                emptySet()
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception getting paired devices", e)
            emptySet()
        }
    }
    
    fun pairDevice(device: BluetoothDevice, listener: BluetoothPairingListener): Boolean {
        if (!hasAllRequiredPermissions()) {
            listener.onPairingFailed(device, "Missing required permissions")
            return false
        }
        
        try {
            this.pairingListener = listener
            
            // Register for pairing events
            val filter = IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED)
            activity.registerReceiver(bluetoothReceiver, filter)
            
            listener.onPairingRequested(device)
            return device.createBond()
            
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception during pairing", e)
            listener.onPairingFailed(device, "Permission denied: ${e.message}")
            return false
        } catch (e: Exception) {
            Log.e(TAG, "Error during pairing", e)
            listener.onPairingFailed(device, "Pairing failed: ${e.message}")
            return false
        }
    }
    
    fun connectToDevice(device: BluetoothDevice, listener: BluetoothConnectionListener) {
        if (!hasAllRequiredPermissions()) {
            listener.onConnectionError(device, "Missing required permissions")
            return
        }
        
        Thread {
            try {
                this.connectionListener = listener
                listener.onConnecting(device)
                
                // Cancel discovery to free up resources
                if (bluetoothAdapter?.isDiscovering == true) {
                    bluetoothAdapter.cancelDiscovery()
                }
                
                // Create socket
                val socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
                
                // Connect with timeout
                socket.connect()
                
                currentSocket = socket
                currentDevice = device
                isConnected = true
                
                listener.onConnected(device, socket)
                
            } catch (e: IOException) {
                Log.e(TAG, "Connection failed", e)
                listener.onConnectionError(device, "Connection failed: ${e.message}")
                cleanupConnection()
            } catch (e: SecurityException) {
                Log.e(TAG, "Security exception during connection", e)
                listener.onConnectionError(device, "Permission denied: ${e.message}")
                cleanupConnection()
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected error during connection", e)
                listener.onConnectionError(device, "Unexpected error: ${e.message}")
                cleanupConnection()
            }
        }.start()
    }
    
    fun disconnect() {
        try {
            currentSocket?.close()
            
            currentDevice?.let { device ->
                connectionListener?.onDisconnected(device)
            }
            
        } catch (e: IOException) {
            Log.e(TAG, "Error closing socket", e)
        } finally {
            cleanupConnection()
        }
    }
    
    fun isConnected(): Boolean {
        return isConnected && currentSocket?.isConnected == true
    }
    
    fun getCurrentDevice(): BluetoothDevice? {
        return if (isConnected) currentDevice else null
    }
    
    fun getBluetoothAdapter(): BluetoothAdapter? {
        return bluetoothAdapter
    }
    
    private fun cleanupConnection() {
        isConnected = false
        currentDevice = null
        currentSocket = null
    }
    
    fun cleanup() {
        stopDiscovery()
        disconnect()
        
        try {
            activity.unregisterReceiver(bluetoothReceiver)
        } catch (e: IllegalArgumentException) {
            // Receiver not registered, ignore
        }
    }
    
    // Listener interfaces
    interface BluetoothDiscoveryListener {
        fun onDeviceFound(device: BluetoothDevice, rssi: Int?)
        fun onDiscoveryStarted()
        fun onDiscoveryFinished(devices: Set<BluetoothDevice>)
        fun onDiscoveryError(error: String)
    }
    
    interface BluetoothPairingListener {
        fun onPairingRequested(device: BluetoothDevice)
        fun onPairingStarted(device: BluetoothDevice)
        fun onPairingSuccess(device: BluetoothDevice)
        fun onPairingFailed(device: BluetoothDevice, error: String)
    }
    
    interface BluetoothConnectionListener {
        fun onConnecting(device: BluetoothDevice)
        fun onConnected(device: BluetoothDevice, socket: BluetoothSocket)
        fun onDisconnected(device: BluetoothDevice)
        fun onConnectionError(device: BluetoothDevice, error: String)
    }
}
