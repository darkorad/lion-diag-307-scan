
package com.lovable.liondiag307scan.bt;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.bluetooth.*;
import android.content.*;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import java.io.IOException;
import java.util.UUID;

public class BluetoothClassicManager {

    public interface DiscoveryListener {
        void onDeviceFound(BluetoothDevice device, Short rssi);
        void onDiscoveryFinished();
        void onError(String msg);
    }

    public interface PairingListener {
        void onBonding();
        void onBonded();
        void onUnbonded();
        void onError(String msg);
    }

    public interface ConnectionListener {
        void onConnected(BluetoothSocket socket);
        void onDisconnected();
        void onError(String msg);
    }

    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");
    private final Activity activity;
    private final BluetoothAdapter adapter;
    private DiscoveryListener discoveryListener;
    private PairingListener pairingListener;
    private Thread connThread;
    private BluetoothSocket socket;

    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        @SuppressLint("MissingPermission")
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                short rssi = intent.getShortExtra(BluetoothDevice.EXTRA_RSSI, Short.MIN_VALUE);
                if (device != null && discoveryListener != null) {
                    discoveryListener.onDeviceFound(device, rssi);
                }
            } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                if (discoveryListener != null) {
                    discoveryListener.onDiscoveryFinished();
                }
                unregisterReceiverSafe(this);
            } else if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
                int state = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
                if (pairingListener != null) {
                    switch (state) {
                        case BluetoothDevice.BOND_BONDING:
                            pairingListener.onBonding();
                            break;
                        case BluetoothDevice.BOND_BONDED:
                            pairingListener.onBonded();
                            break;
                        case BluetoothDevice.BOND_NONE:
                            pairingListener.onUnbonded();
                            break;
                    }
                }
            }
        }
    };

    public BluetoothClassicManager(Activity activity) {
        this.activity = activity;
        this.adapter = BluetoothAdapter.getDefaultAdapter();
    }

    @SuppressLint("MissingPermission")
    public boolean ensureEnabled(Runnable onNeedEnable) {
        if (adapter == null) return false;
        if (!adapter.isEnabled()) {
            Intent intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            activity.startActivity(intent);
            if (onNeedEnable != null) {
                onNeedEnable.run();
            }
            return false;
        }
        return true;
    }

    @SuppressLint("MissingPermission")
    public void startDiscovery(DiscoveryListener listener) {
        this.discoveryListener = listener;
        if (!ensureEnabled(null)) return;
        stopDiscovery();

        IntentFilter filter = new IntentFilter();
        filter.addAction(BluetoothDevice.ACTION_FOUND);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        activity.registerReceiver(receiver, filter);
        
        if (!adapter.startDiscovery()) {
            listener.onError("Failed to start discovery");
        }
    }

    @SuppressLint("MissingPermission")
    public void stopDiscovery() {
        try {
            if (adapter != null && adapter.isDiscovering()) {
                adapter.cancelDiscovery();
            }
        } catch (Exception e) {
            Log.e("BT", "Error stopping discovery", e);
        }
        unregisterReceiverSafe(receiver);
    }

    @SuppressLint("MissingPermission")
    public void pair(BluetoothDevice device, PairingListener listener) {
        this.pairingListener = listener;
        IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        activity.registerReceiver(receiver, filter);

        if (device.getBondState() == BluetoothDevice.BOND_BONDED) {
            listener.onBonded();
            return;
        }
        
        try {
            boolean result = device.createBond();
            if (!result) {
                listener.onError("createBond() failed");
            }
        } catch (Exception e) {
            listener.onError("Pairing error: " + e.getMessage());
        }
    }

    @SuppressLint("MissingPermission")
    public void connectSpp(BluetoothDevice device, ConnectionListener listener) {
        // Cancel discovery makes connection faster & reliable
        try {
            if (adapter != null && adapter.isDiscovering()) {
                adapter.cancelDiscovery();
            }
        } catch (Exception e) {
            Log.e("BT", "Error canceling discovery", e);
        }

        if (connThread != null) {
            connThread.interrupt();
        }
        
        connThread = new Thread(() -> {
            try {
                BluetoothSocket sock;
                if (Build.VERSION.SDK_INT >= 10) {
                    sock = device.createInsecureRfcommSocketToServiceRecord(SPP_UUID);
                } else {
                    sock = device.createRfcommSocketToServiceRecord(SPP_UUID);
                }
                socket = sock;
                sock.connect();
                new Handler(Looper.getMainLooper()).post(() -> listener.onConnected(sock));
            } catch (IOException e) {
                Log.e("BT", "SPP connect failed", e);
                new Handler(Looper.getMainLooper()).post(() -> listener.onError("Connect failed: " + e.getMessage()));
                close();
            }
        });
        connThread.start();
    }

    public void close() {
        try {
            if (socket != null) {
                socket.close();
            }
        } catch (Exception e) {
            Log.e("BT", "Error closing socket", e);
        }
        socket = null;
        connThread = null;
    }

    private void unregisterReceiverSafe(BroadcastReceiver br) {
        try {
            activity.unregisterReceiver(br);
        } catch (Exception e) {
            Log.e("BT", "Error unregistering receiver", e);
        }
    }
}
