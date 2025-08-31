package com.lovable.liondiag307scan.bt

import android.Manifest
import android.app.Activity
import android.bluetooth.*
import android.content.*
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.io.IOException
import java.util.*
import kotlin.collections.HashSet

/**
 * Enhanced Bluetooth Manager for Lion Diag Scan
 * Handles both Classic and BLE scanning, pairing, and connection
 * Optimized for OBD2 adapters with proper permission handling
 */
class EnhancedBluetoothManager(private val activity: Activity) {
    
    companion object {
        private const val TAG = "EnhancedBluetoothManager"
        private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb")
        private const val REQUEST_ENABLE_BT = 1001
        private const val REQUEST_PERMISSIONS = 1002
        private const val DISCOVERY_TIMEOUT = 15000L // 15 seconds
        private const val CONNECTION_TIMEOUT = 30000L // 30 seconds
    }

    // Bluetooth Components
    internal val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private val bluetoothManager: BluetoothManager? = activity.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private var currentSocket: BluetoothSocket? = null
    private var connectionThread: Thread? = null
    
    // Discovery state
    private var isScanning = false
    private val discoveredDevices = mutableSetOf<BluetoothDevice>()
    private var discoveryListener: BluetoothDiscoveryListener? = null
    private var discoveryTimeoutHandler: Handler? = null
    
    // Connection state
    private var connectionListener: BluetoothConnectionListener? = null
    private var currentDevice: BluetoothDevice? = null
    
    // Pairing state
    private var pairingListener: BluetoothPairingListener? = null

    // Interfaces
    interface BluetoothDiscoveryListener {
        fun onDeviceFound(device: BluetoothDevice, rssi: Int?)
        fun onDiscoveryStarted()
        fun onDiscoveryFinished(devices: Set<BluetoothDevice>)
        fun onDiscoveryError(error: String)
    }

    interface BluetoothConnectionListener {
        fun onConnecting(device: BluetoothDevice)
        fun onConnected(device: BluetoothDevice, socket: BluetoothSocket)
        fun onDisconnected(device: BluetoothDevice)
        fun onConnectionError(device: BluetoothDevice, error: String)
    }

    interface BluetoothPairingListener {
        fun onPairingRequested(device: BluetoothDevice)
        fun onPairingStarted(device: BluetoothDevice)
        fun onPairingSuccess(device: BluetoothDevice)
        fun onPairingFailed(device: BluetoothDevice, error: String)
    }

    // Broadcast receiver for Bluetooth events
    private val bluetoothReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                BluetoothDevice.ACTION_FOUND -> {
                    val device: BluetoothDevice? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    }
                    
                    val rssi = intent.getShortExtra(BluetoothDevice.EXTRA_RSSI, Short.MIN_VALUE).toInt()

                    device?.let {
                        if (discoveredDevices.add(it)) {
                            Log.d(TAG, "New device found: ${getDeviceName(it)} (${it.address}) RSSI: $rssi")
                            discoveryListener?.onDeviceFound(it, if (rssi != Short.MIN_VALUE.toInt()) rssi else null)
                        }
                    }
                }
                
                BluetoothAdapter.ACTION_DISCOVERY_STARTED -> {
                    Log.d(TAG, "Bluetooth discovery started")
                    discoveryListener?.onDiscoveryStarted()
                }
                
                BluetoothAdapter.ACTION_DISCOVERY_FINISHED -> {
                    Log.d(TAG, "Bluetooth discovery finished. Found ${discoveredDevices.size} devices")
                    isScanning = false
                    discoveryListener?.onDiscoveryFinished(discoveredDevices.toSet())
                    unregisterBluetoothReceiver()
                }
                
                BluetoothDevice.ACTION_BOND_STATE_CHANGED -> {
                    val device: BluetoothDevice? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    }
                    
                    val bondState = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR)

                    device?.let { dev ->
                        when (bondState) {
                            BluetoothDevice.BOND_BONDING -> {
                                Log.d(TAG, "Pairing started with ${getDeviceName(dev)}")
                                pairingListener?.onPairingStarted(dev)
                            }
                            BluetoothDevice.BOND_BONDED -> {
                                Log.d(TAG, "Successfully paired with ${getDeviceName(dev)}")
                                pairingListener?.onPairingSuccess(dev)
                            }
                            BluetoothDevice.BOND_NONE -> {
                                Log.w(TAG, "Pairing failed or unpaired with ${getDeviceName(dev)}")
                                pairingListener?.onPairingFailed(dev, "Pairing was cancelled or failed")
                            }
                            else -> {
                                // Ignore other states
                            }
                        }
                    }
                }

                BluetoothAdapter.ACTION_STATE_CHANGED -> {
                    val state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR)
                    Log.d(TAG, "Bluetooth adapter state changed: $state")

                    if (state == BluetoothAdapter.STATE_OFF) {
                        // Clean up when Bluetooth is turned off
                        stopDiscovery()
                        disconnect()
                    }
                }
            }
        }
    }
    
    /**
     * Check if device supports Bluetooth
     */
    fun isBluetoothSupported(): Boolean {
        return bluetoothAdapter != null
    }
    
    /**
     * Check if Bluetooth is currently enabled
     */
    fun isBluetoothEnabled(): Boolean {
        return bluetoothAdapter?.isEnabled == true
    }
    
    /**
     * Request to enable Bluetooth
     */
    fun requestEnableBluetooth(): Boolean {
        if (!isBluetoothSupported()) return false

        if (!isBluetoothEnabled()) {
            if (hasBluetoothPermissions()) {
                val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
                activity.startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT)
                return true
            } else {
                Log.w(TAG, "Cannot enable Bluetooth without proper permissions")
                return false
            }
        }
        return true
    }
    
    /**
     * Check if all required permissions are granted
     */
    fun hasAllRequiredPermissions(): Boolean {
        return hasBluetoothPermissions() && hasLocationPermissions()
    }

    /**
     * Check Bluetooth-specific permissions
     */
    private fun hasBluetoothPermissions(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
            hasPermission(Manifest.permission.BLUETOOTH_SCAN) &&
            hasPermission(Manifest.permission.BLUETOOTH_CONNECT)
        } else {
            // Pre-Android 12 requires BLUETOOTH and BLUETOOTH_ADMIN
            hasPermission(Manifest.permission.BLUETOOTH) &&
            hasPermission(Manifest.permission.BLUETOOTH_ADMIN)
        }
    }

    /**
     * Check location permissions (required for device discovery)
     */
    private fun hasLocationPermissions(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)
        } else {
            hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION) ||
            hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }
    
    /**
     * Request all required permissions
     */
    fun requestAllPermissions(): Array<String> {
        val permissionsToRequest = mutableListOf<String>()

        // Bluetooth permissions
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!hasPermission(Manifest.permission.BLUETOOTH_SCAN)) {
                permissionsToRequest.add(Manifest.permission.BLUETOOTH_SCAN)
            }
            if (!hasPermission(Manifest.permission.BLUETOOTH_CONNECT)) {
                permissionsToRequest.add(Manifest.permission.BLUETOOTH_CONNECT)
            }
        } else {
            if (!hasPermission(Manifest.permission.BLUETOOTH)) {
                permissionsToRequest.add(Manifest.permission.BLUETOOTH)
            }
            if (!hasPermission(Manifest.permission.BLUETOOTH_ADMIN)) {
                permissionsToRequest.add(Manifest.permission.BLUETOOTH_ADMIN)
            }
        }
        
        // Location permissions
        if (!hasLocationPermissions()) {
            permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        
        if (permissionsToRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                activity,
                permissionsToRequest.toTypedArray(),
                REQUEST_PERMISSIONS
            )
        }
        
        return permissionsToRequest.toTypedArray()
    }
    
    /**
     * Start device discovery (scanning)
     */
    fun startDiscovery(listener: BluetoothDiscoveryListener): Boolean {
        if (!isBluetoothSupported()) {
            listener.onDiscoveryError("Bluetooth not supported on this device")
            return false
        }

        if (!isBluetoothEnabled()) {
            listener.onDiscoveryError("Bluetooth is not enabled")
            return false
        }

        if (!hasAllRequiredPermissions()) {
            listener.onDiscoveryError("Missing required permissions")
            return false
        }
        
        if (isScanning) {
            Log.w(TAG, "Discovery already in progress")
            return false
        }
        
        this.discoveryListener = listener
        discoveredDevices.clear()

        try {
            // Register broadcast receiver
            registerBluetoothReceiver()
            
            // Cancel any ongoing discovery
            bluetoothAdapter?.cancelDiscovery()
            
            // Start discovery
            val started = bluetoothAdapter?.startDiscovery() == true
            if (started) {
                isScanning = true
                Log.d(TAG, "Starting Bluetooth device discovery")

                // Set timeout for discovery
                discoveryTimeoutHandler = Handler(Looper.getMainLooper())
                discoveryTimeoutHandler?.postDelayed({
                    if (isScanning) {
                        Log.w(TAG, "Discovery timeout reached")
                        stopDiscovery()
                    }
                }, DISCOVERY_TIMEOUT)

                return true
            } else {
                listener.onDiscoveryError("Failed to start Bluetooth discovery")
                unregisterBluetoothReceiver()
                return false
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception during discovery start", e)
            listener.onDiscoveryError("Permission denied: ${e.message}")
            return false
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error during discovery start", e)
            listener.onDiscoveryError("Unexpected error: ${e.message}")
            return false
        }
    }
    
    /**
     * Stop device discovery
     */
    fun stopDiscovery() {
        if (!isScanning) return

        try {
            bluetoothAdapter?.cancelDiscovery()
            isScanning = false
            discoveryTimeoutHandler?.removeCallbacksAndMessages(null)
            unregisterBluetoothReceiver()
            Log.d(TAG, "Bluetooth discovery stopped")
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception during discovery stop", e)
        }
    }
    
    /**
     * Get list of paired/bonded devices
     */
    fun getPairedDevices(): Set<BluetoothDevice> {
        if (!hasBluetoothPermissions()) {
            Log.w(TAG, "Cannot get paired devices without Bluetooth permissions")
            return emptySet()
        }

        return try {
            bluetoothAdapter?.bondedDevices ?: emptySet()
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception getting paired devices", e)
            emptySet()
        }
    }
    
    /**
     * Pair with a device
     */
    fun pairDevice(device: BluetoothDevice, listener: BluetoothPairingListener): Boolean {
        if (!hasBluetoothPermissions()) {
            listener.onPairingFailed(device, "Missing Bluetooth permissions")
            return false
        }
        
        this.pairingListener = listener

        try {
            // Check if already paired
            if (device.bondState == BluetoothDevice.BOND_BONDED) {
                listener.onPairingSuccess(device)
                return true
            }
            
            // Register for pairing events
            registerBluetoothReceiver()
            
            // Start pairing
            listener.onPairingRequested(device)
            val result = device.createBond()

            if (!result) {
                listener.onPairingFailed(device, "Failed to initiate pairing")
                unregisterBluetoothReceiver()
            }
            
            return result
        } catch (e: SecurityException) {
            listener.onPairingFailed(device, "Permission denied: ${e.message}")
            return false
        } catch (e: Exception) {
            listener.onPairingFailed(device, "Pairing error: ${e.message}")
            return false
        }
    }
    
    /**
     * Connect to a device using SPP (Serial Port Profile)
     */
    fun connectToDevice(device: BluetoothDevice, listener: BluetoothConnectionListener) {
        if (!hasBluetoothPermissions()) {
            listener.onConnectionError(device, "Missing Bluetooth permissions")
            return
        }
        
        // Disconnect any existing connection
        disconnect()

        this.connectionListener = listener
        this.currentDevice = device

        listener.onConnecting(device)

        connectionThread = Thread {
            try {
                Log.d(TAG, "Connecting to ${getDeviceName(device)} (${device.address})")
                
                // Cancel discovery to improve connection reliability
                bluetoothAdapter?.cancelDiscovery()
                
                // Create socket with fallback strategies
                val socket = createBluetoothSocket(device)
                currentSocket = socket
                
                // Connect with timeout
                val connectRunnable = Runnable { socket.connect() }
                val connectThread = Thread(connectRunnable)
                connectThread.start()
                connectThread.join(CONNECTION_TIMEOUT)
                
                if (connectThread.isAlive) {
                    connectThread.interrupt()
                    socket.close()
                    throw IOException("Connection timeout after ${CONNECTION_TIMEOUT}ms")
                }
                
                if (socket.isConnected) {
                    Log.d(TAG, "Successfully connected to ${getDeviceName(device)}")
                    Handler(Looper.getMainLooper()).post {
                        listener.onConnected(device, socket)
                    }
                } else {
                    throw IOException("Socket connection failed")
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Connection failed to ${getDeviceName(device)}", e)
                Handler(Looper.getMainLooper()).post {
                    listener.onConnectionError(device, "Connection failed: ${e.message}")
                }

                // Clean up
                try {
                    currentSocket?.close()
                } catch (closeException: Exception) {
                    Log.e(TAG, "Error closing socket after failed connection", closeException)
                }
                currentSocket = null
            }
        }

        connectionThread?.start()
    }
    
    /**
     * Disconnect from current device
     */
    fun disconnect() {
        connectionThread?.interrupt()
        connectionThread = null

        currentSocket?.let { socket ->
            try {
                socket.close()
                Log.d(TAG, "Disconnected from device")
                currentDevice?.let { device ->
                    connectionListener?.onDisconnected(device)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error closing socket", e)
            }
        }

        currentSocket = null
        currentDevice = null
    }
    
    /**
     * Check if currently connected
     */
    fun isConnected(): Boolean {
        return currentSocket?.isConnected == true
    }
    
    /**
     * Get current connected device
     */
    fun getCurrentDevice(): BluetoothDevice? {
        return if (isConnected()) currentDevice else null
    }
    
    /**
     * Get current socket for data communication
     */
    fun getCurrentSocket(): BluetoothSocket? {
        return if (isConnected()) currentSocket else null
    }
    
    /**
     * Create Bluetooth socket with fallback strategies
     */
    private fun createBluetoothSocket(device: BluetoothDevice): BluetoothSocket {
        return try {
            // Try insecure connection first (works better with most OBD2 adapters)
            device.createInsecureRfcommSocketToServiceRecord(SPP_UUID)
        } catch (e: Exception) {
            try {
                // Fallback to secure connection
                device.createRfcommSocketToServiceRecord(SPP_UUID)
            } catch (e2: Exception) {
                // Last resort: use reflection for older devices
                try {
                    val method = device.javaClass.getMethod("createRfcommSocket", Int::class.javaPrimitiveType)
                    method.invoke(device, 1) as BluetoothSocket
                } catch (e3: Exception) {
                    throw IOException("Failed to create Bluetooth socket", e3)
                }
            }
        }
    }
    
    /**
     * Register broadcast receiver for Bluetooth events
     */
    private fun registerBluetoothReceiver() {
        try {
            val filter = IntentFilter().apply {
                addAction(BluetoothDevice.ACTION_FOUND)
                addAction(BluetoothAdapter.ACTION_DISCOVERY_STARTED)
                addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)
                addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED)
                addAction(BluetoothAdapter.ACTION_STATE_CHANGED)
            }
            activity.registerReceiver(bluetoothReceiver, filter)
        } catch (e: Exception) {
            Log.e(TAG, "Error registering Bluetooth receiver", e)
        }
    }

    /**
     * Unregister broadcast receiver
     */
    private fun unregisterBluetoothReceiver() {
        try {
            activity.unregisterReceiver(bluetoothReceiver)
        } catch (e: Exception) {
            // Receiver might not be registered, ignore
        }
    }
    
    /**
     * Get device name safely
     */
    private fun getDeviceName(device: BluetoothDevice): String {
        return try {
            if (hasBluetoothPermissions()) {
                device.name ?: "Unknown Device"
            } else {
                "Unknown Device"
            }
        } catch (e: SecurityException) {
            "Unknown Device"
        }
    }
    
    /**
     * Check if specific permission is granted
     */
    private fun hasPermission(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED
    }
    
    /**
     * Clean up resources
     */
    fun cleanup() {
        stopDiscovery()
        disconnect()
        unregisterBluetoothReceiver()
        discoveryTimeoutHandler?.removeCallbacksAndMessages(null)
    }
}
