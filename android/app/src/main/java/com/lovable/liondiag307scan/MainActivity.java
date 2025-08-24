package com.lovable.liondiag307scan;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d("DEBUG", "MainActivity started");
        Toast.makeText(this, "App started", Toast.LENGTH_SHORT).show();

        this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
            add(CustomBluetoothSerial.class);
        }});
    }
}
