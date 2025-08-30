
package com.lovable.liondiag307scan

import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.util.Log
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import com.getcapacitor.annotation.PluginMethod
import com.lovable.liondiag307scan.bt.EnhancedBluetoothManager
import org.json.JSONArray
import org.json.JSONObject
import java.io.InputStream
import java.io.OutputStream
import java.nio.charset.StandardCharsets

/**
 * Lion Diag Bluetooth Plugin
 * Enhanced Capacitor plugin for reliable OBD2 Bluetooth connectivity
 */
@CapacitorPlugin(
    name = "LionDiagBluetooth",
    permissions = [
        Permission(strings = ["android.permission.BLUETOOTH"], alias = "bluetooth"),
        Permission(strings = ["android.permission.BLUETOOTH_ADMIN"], alias = "bluetoothAdmin"),
        Permission(strings = ["android.permission.BLUETOOTH_CONNECT"], alias = "bluetoothConnect"),
        Permission(strings = ["android.permission.BLUETOOTH_SCAN"], alias = "bluetoothScan"),
        Permission(strings = ["android.permission.ACCESS_FINE_LOCATION"], alias = "location"),
        Permission(strings = ["android.permission.ACCESS_COARSE_LOCATION"], alias = "coarseLocation")
    ]
)
class LionDiagBluetoothPlugin : Plugin() {
    
    companion object {
        private const val TAG = "LionDiagBluetoothPlugin"
    }
    
    private lateinit var bluetoothManager: EnhancedBluetoothManager
    private var currentSocket: BluetoothSocket? = null
    private var inputStream: InputStream? = null
    private var outputStream: OutputStream? = null
    private var isInitialized = false
    
    override fun load() {
        super.load()
        try {
            bluetoothManager = EnhancedBluetoothManager(activity)
            isInitialized = true
            Log.d(TAG, "LionDiagBluetoothPlugin loaded successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize LionDiagBluetoothPlugin", e)
        }
    }
    
    /**
     * Check if Bluetooth is supported and available
     */
    @PluginMethod
    fun checkBluetoothStatus(call: PluginCall) {
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        val result = JSObject().apply {
            put("supported", bluetoothManager.isBluetoothSupported())
            put("enabled", bluetoothManager.isBluetoothEnabled())
            put("hasPermissions", bluetoothManager.hasAllRequiredPermissions())
        }
        
        call.resolve(result)
    }
    
    /**
     * Request all required permissions
     */
    @PluginMethod
    override fun requestPermissions(call: PluginCall) {
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        val permissionsNeeded = bluetoothManager.requestAllPermissions()
        
        if (permissionsNeeded.isEmpty()) {
            // All permissions already granted
            val result = JSObject().apply {
                put("granted", true)
                put("message", "All permissions already granted")
            }
            call.resolve(result)
        } else {
            // Store call for callback
            saveCall(call)
        }
    }
    
    @PermissionCallback
    private fun handlePermissionResult(call: PluginCall) {
        val hasPermissions = bluetoothManager.hasAllRequiredPermissions()
        val result = JSObject().apply {
            put("granted", hasPermissions)
            put("message", if (hasPermissions) "Permissions granted" else "Some permissions denied")
        }
        call.resolve(result)
    }
    
    /**
     * Enable Bluetooth if not enabled
     */
    @PluginMethod
    fun enableBluetooth(call: PluginCall) {
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        if (bluetoothManager.isBluetoothEnabled()) {
            val result = JSObject().apply {
                put("enabled", true)
                put("message", "Bluetooth already enabled")
            }
            call.resolve(result)
            return
        }
        
        val requested = bluetoothManager.requestEnableBluetooth()
        val result = JSObject().apply {
            put("requested", requested)
            put("message", if (requested) "Enable request sent" else "Cannot request enable")
        }
        call.resolve(result)
    }
    
    /**
     * Start device discovery/scanning
     */
    @PluginMethod
    fun startDiscovery(call: PluginCall) {
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        val listener = object : EnhancedBluetoothManager.BluetoothDiscoveryListener {
            override fun onDeviceFound(device: BluetoothDevice, rssi: Int?) {
                val deviceInfo = JSObject().apply {
                    put("name", getDeviceName(device))
                    put("address", device.address)
                    put("type", device.type)
                    put("bonded", device.bondState == BluetoothDevice.BOND_BONDED)
                    put("rssi", rssi ?: 0)
                    put("compatibility", calculateOBD2Compatibility(device))
                }
                
                notifyListeners("deviceFound", deviceInfo)
            }
            
            override fun onDiscoveryStarted() {
                notifyListeners("discoveryStarted", JSObject())
            }
            
            override fun onDiscoveryFinished(devices: Set<BluetoothDevice>) {
                val devicesArray = JSONArray()
                devices.forEach { device ->
                    val deviceInfo = JSONObject().apply {
                        put("name", getDeviceName(device))
                        put("address", device.address)
                        put("type", device.type)
                        put("bonded", device.bondState == BluetoothDevice.BOND_BONDED)
                        put("compatibility", calculateOBD2Compatibility(device))
                    }
                    devicesArray.put(deviceInfo)
                }
                
                val result = JSObject().apply {
                    put("devices", devicesArray)
                    put("count", devices.size)
                }
                
                notifyListeners("discoveryFinished", result)
            }
            
            override fun onDiscoveryError(error: String) {
                val errorResult = JSObject().apply {
                    put("error", error)
                }
                notifyListeners("discoveryError", errorResult)
            }
        }
        
        val started = bluetoothManager.startDiscovery(listener)
        
        if (started) {
            val result = JSObject().apply {
                put("success", true)
                put("message", "Discovery started")
            }
            call.resolve(result)
        } else {
            call.reject("Failed to start discovery")
        }
    }
    
    /**
     * Stop device discovery
     */
    @PluginMethod
    fun stopDiscovery(call: PluginCall) {
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        bluetoothManager.stopDiscovery()
        
        val result = JSObject().apply {
            put("success", true)
            put("message", "Discovery stopped")
        }
        call.resolve(result)
    }
    
    /**
     * Get paired/bonded devices
     */
    @PluginMethod
    fun getPairedDevices(call: PluginCall) {
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        val pairedDevices = bluetoothManager.getPairedDevices()
        val devicesArray = JSONArray()
        
        pairedDevices.forEach { device ->
            val deviceInfo = JSONObject().apply {
                put("name", getDeviceName(device))
                put("address", device.address)
                put("type", device.type)
                put("bonded", true)
                put("compatibility", calculateOBD2Compatibility(device))
            }
            devicesArray.put(deviceInfo)
        }
        
        val result = JSObject().apply {
            put("devices", devicesArray)
            put("count", pairedDevices.size)
        }
        
        call.resolve(result)
    }
    
    /**
     * Pair with a device
     */
    @PluginMethod
    fun pairDevice(call: PluginCall) {
        val deviceAddress = call.getString("address")
        if (deviceAddress.isNullOrEmpty()) {
            call.reject("Device address is required")
            return
        }
        
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        try {
            val device = bluetoothManager.getBluetoothAdapter()?.getRemoteDevice(deviceAddress)
            if (device == null) {
                call.reject("Invalid device address")
                return
            }
            
            val listener = object : EnhancedBluetoothManager.BluetoothPairingListener {
                override fun onPairingRequested(device: BluetoothDevice) {
                    val result = JSObject().apply {
                        put("state", "requested")
                        put("device", getDeviceName(device))
                    }
                    notifyListeners("pairingState", result)
                }
                
                override fun onPairingStarted(device: BluetoothDevice) {
                    val result = JSObject().apply {
                        put("state", "started")
                        put("device", getDeviceName(device))
                    }
                    notifyListeners("pairingState", result)
                }
                
                override fun onPairingSuccess(device: BluetoothDevice) {
                    val result = JSObject().apply {
                        put("success", true)
                        put("device", getDeviceName(device))
                        put("address", device.address)
                    }
                    call.resolve(result)
                }
                
                override fun onPairingFailed(device: BluetoothDevice, error: String) {
                    call.reject("Pairing failed: $error")
                }
            }
            
            val pairingStarted = bluetoothManager.pairDevice(device, listener)
            if (!pairingStarted) {
                call.reject("Failed to initiate pairing")
            }
            
        } catch (e: Exception) {
            call.reject("Pairing error: ${e.message}")
        }
    }
    
    /**
     * Connect to a device
     */
    @PluginMethod
    fun connectToDevice(call: PluginCall) {
        val deviceAddress = call.getString("address")
        if (deviceAddress.isNullOrEmpty()) {
            call.reject("Device address is required")
            return
        }
        
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        try {
            val device = bluetoothManager.getBluetoothAdapter()?.getRemoteDevice(deviceAddress)
            if (device == null) {
                call.reject("Invalid device address")
                return
            }
            
            val listener = object : EnhancedBluetoothManager.BluetoothConnectionListener {
                override fun onConnecting(device: BluetoothDevice) {
                    val result = JSObject().apply {
                        put("state", "connecting")
                        put("device", getDeviceName(device))
                    }
                    notifyListeners("connectionState", result)
                }
                
                override fun onConnected(device: BluetoothDevice, socket: BluetoothSocket) {
                    currentSocket = socket
                    try {
                        inputStream = socket.inputStream
                        outputStream = socket.outputStream
                        
                        val result = JSObject().apply {
                            put("success", true)
                            put("device", getDeviceName(device))
                            put("address", device.address)
                            put("connected", true)
                        }
                        
                        notifyListeners("connected", result)
                        call.resolve(result)
                    } catch (e: Exception) {
                        call.reject("Failed to get socket streams: ${e.message}")
                    }
                }
                
                override fun onDisconnected(device: BluetoothDevice) {
                    cleanupConnection()
                    val result = JSObject().apply {
                        put("device", getDeviceName(device))
                        put("connected", false)
                    }
                    notifyListeners("disconnected", result)
                }
                
                override fun onConnectionError(device: BluetoothDevice, error: String) {
                    cleanupConnection()
                    call.reject("Connection failed: $error")
                }
            }
            
            bluetoothManager.connectToDevice(device, listener)
            
        } catch (e: Exception) {
            call.reject("Connection error: ${e.message}")
        }
    }
    
    /**
     * Disconnect from current device
     */
    @PluginMethod
    fun disconnect(call: PluginCall) {
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        bluetoothManager.disconnect()
        cleanupConnection()
        
        val result = JSObject().apply {
            put("success", true)
            put("message", "Disconnected")
        }
        call.resolve(result)
    }
    
    /**
     * Check connection status
     */
    @PluginMethod
    fun isConnected(call: PluginCall) {
        if (!isInitialized) {
            call.reject("Plugin not initialized")
            return
        }
        
        val connected = bluetoothManager.isConnected()
        val currentDevice = bluetoothManager.getCurrentDevice()
        
        val result = JSObject().apply {
            put("connected", connected)
            if (connected && currentDevice != null) {
                put("device", getDeviceName(currentDevice))
                put("address", currentDevice.address)
            }
        }
        
        call.resolve(result)
    }
    
    /**
     * Send OBD2 command to connected device
     */
    @PluginMethod
    fun sendCommand(call: PluginCall) {
        val command = call.getString("command")
        if (command.isNullOrEmpty()) {
            call.reject("Command is required")
            return
        }
        
        val timeout = call.getInt("timeout") ?: 5000 // Default 5 second timeout
        
        if (outputStream == null || inputStream == null) {
            call.reject("Not connected to any device")
            return
        }
        
        Thread {
            try {
                // Send command with carriage return
                val commandWithCR = "$command\r"
                outputStream?.write(commandWithCR.toByteArray(StandardCharsets.US_ASCII))
                outputStream?.flush()
                
                Log.d(TAG, "Sent command: $command")
                
                // Read response until '>' prompt or timeout
                val response = StringBuilder()
                val buffer = ByteArray(1024)
                val startTime = System.currentTimeMillis()
                
                while (!response.contains(">") && 
                       (System.currentTimeMillis() - startTime) < timeout) {
                    
                    if (inputStream?.available() ?: 0 > 0) {
                        val bytesRead = inputStream?.read(buffer) ?: 0
                        if (bytesRead > 0) {
                            response.append(String(buffer, 0, bytesRead, StandardCharsets.US_ASCII))
                        }
                    } else {
                        Thread.sleep(50) // Small delay to prevent busy waiting
                    }
                }
                
                val responseStr = response.toString().trim()
                Log.d(TAG, "Received response: $responseStr")
                
                val result = JSObject().apply {
                    put("success", true)
                    put("command", command)
                    put("response", responseStr)
                    put("timestamp", System.currentTimeMillis())
                }
                
                call.resolve(result)
                
            } catch (e: Exception) {
                Log.e(TAG, "Error sending command: $command", e)
                call.reject("Command failed: ${e.message}")
            }
        }.start()
    }
    
    /**
     * Initialize ELM327 adapter with optimal settings
     */
    @PluginMethod
    fun initializeELM327(call: PluginCall) {
        if (outputStream == null || inputStream == null) {
            call.reject("Not connected to any device")
            return
        }
        
        Thread {
            try {
                val initCommands = listOf(
                    "ATZ",      // Reset
                    "ATE0",     // Echo off
                    "ATL0",     // Linefeeds off
                    "ATS0",     // Spaces off
                    "ATH1",     // Headers on
                    "ATSP0",    // Auto protocol
                    "0100"      // Test communication
                )
                
                val responses = mutableListOf<String>()
                
                for (command in initCommands) {
                    Thread.sleep(200) // Small delay between commands
                    
                    try {
                        sendCommandSync(command, 3000)?.let { response ->
                            responses.add("$command: $response")
                        }
                    } catch (e: Exception) {
                        responses.add("$command: ERROR - ${e.message}")
                    }
                }
                
                val result = JSObject().apply {
                    put("success", true)
                    put("message", "ELM327 initialized")
                    put("responses", responses.joinToString("\n"))
                }
                
                call.resolve(result)
                
            } catch (e: Exception) {
                call.reject("ELM327 initialization failed: ${e.message}")
            }
        }.start()
    }
    
    /**
     * Send command synchronously (for internal use)
     */
    private fun sendCommandSync(command: String, timeout: Int): String? {
        return try {
            val commandWithCR = "$command\r"
            outputStream?.write(commandWithCR.toByteArray(StandardCharsets.US_ASCII))
            outputStream?.flush()
            
            val response = StringBuilder()
            val buffer = ByteArray(1024)
            val startTime = System.currentTimeMillis()
            
            while (!response.contains(">") && 
                   (System.currentTimeMillis() - startTime) < timeout) {
                
                if (inputStream?.available() ?: 0 > 0) {
                    val bytesRead = inputStream?.read(buffer) ?: 0
                    if (bytesRead > 0) {
                        response.append(String(buffer, 0, bytesRead, StandardCharsets.US_ASCII))
                    }
                } else {
                    Thread.sleep(50)
                }
            }
            
            response.toString().trim()
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Calculate OBD2 compatibility score for a device
     */
    private fun calculateOBD2Compatibility(device: BluetoothDevice): Double {
        val deviceName = getDeviceName(device).lowercase()
        var score = 0.0
        
        // High compatibility indicators
        when {
            deviceName.contains("elm327") -> score += 0.9
            deviceName.contains("obd") -> score += 0.8
            deviceName.contains("vgate") -> score += 0.85
            deviceName.contains("viecar") -> score += 0.85
            deviceName.contains("konnwei") -> score += 0.8
            deviceName.contains("autel") -> score += 0.75
            deviceName.contains("launch") -> score += 0.75
            deviceName.contains("foxwell") -> score += 0.75
            deviceName.contains("topdon") -> score += 0.75
            deviceName.contains("delphi") -> score += 0.7
        }
        
        // Medium compatibility indicators
        when {
            deviceName.contains("bluetooth") && deviceName.contains("car") -> score += 0.6
            deviceName.contains("diagnostic") -> score += 0.65
            deviceName.contains("scan") -> score += 0.6
            deviceName.contains("torque") -> score += 0.7
        }
        
        // Version indicators
        when {
            deviceName.contains("v2.1") -> score += 0.1
            deviceName.contains("v1.5") -> score += 0.05
        }
        
        // Bonded device bonus
        if (device.bondState == BluetoothDevice.BOND_BONDED) {
            score += 0.1
        }
        
        return minOf(1.0, score)
    }
    
    /**
     * Get device name safely
     */
    private fun getDeviceName(device: BluetoothDevice): String {
        return try {
            if (bluetoothManager.hasAllRequiredPermissions()) {
                device.name ?: "Unknown Device"
            } else {
                "Unknown Device"
            }
        } catch (e: SecurityException) {
            "Unknown Device"
        }
    }
    
    /**
     * Clean up connection resources
     */
    private fun cleanupConnection() {
        try {
            inputStream?.close()
            outputStream?.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error closing streams", e)
        }
        
        inputStream = null
        outputStream = null
        currentSocket = null
    }
    
    override fun handleOnDestroy() {
        super.handleOnDestroy()
        
        if (isInitialized) {
            bluetoothManager.cleanup()
        }
        
        cleanupConnection()
    }
}
