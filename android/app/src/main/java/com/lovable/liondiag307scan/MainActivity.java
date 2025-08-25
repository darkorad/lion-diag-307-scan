
package com.lovable.liondiag307scan;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "LionDiag 307 Scan MainActivity started");
        
        // Register our custom Bluetooth plugin
        registerPlugin(CustomBluetoothSerial.class);
        
        Log.d(TAG, "CustomBluetoothSerial plugin registered");
    }
}
