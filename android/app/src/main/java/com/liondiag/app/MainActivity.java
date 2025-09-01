
package com.liondiag.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register the native Bluetooth plugin
        registerPlugin(BluetoothPlugin.class);
    }
}
