package com.thijsvndmeer.clashcounter;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Overlay")
public class OverlayPlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        Context context = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                !Settings.canDrawOverlays(context)) {
            // Request Permission
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + context.getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            call.reject("Permission required. Please grant 'Display over other apps' and try again.");
            return;
        }

        String url = call.getString("url",
                "file:///android_asset/public/index.html");

        Intent intent = new Intent(context, OverlayService.class);
        intent.putExtra("url", url);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }

        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, OverlayService.class);
        context.stopService(intent);
        call.resolve();
    }

    @PluginMethod
    public void resize(PluginCall call) {
        Integer width = call.getInt("width");
        Integer height = call.getInt("height");

        if (width == null || height == null) {
            call.reject("Width and height are required");
            return;
        }

        Context context = getContext();
        Intent intent = new Intent("com.thijsvndmeer.clashcounter.OVERLAY_RESIZE");
        intent.putExtra("width", width);
        intent.putExtra("height", height);
        // Explicitly set package to ensure security and that it reaches our app
        intent.setPackage(context.getPackageName());
        context.sendBroadcast(intent);

        call.resolve();
    }
}
