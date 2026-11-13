package com.blocodenotas.app.utils;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.appcompat.app.AppCompatDelegate;

public class PrefsManager {

    private static final String PREFS_NAME = "bloco_de_notas_prefs";
    private static final String KEY_DARK_MODE = "dark_mode";
    private static final String KEY_TEXT_SCALE = "text_scale"; // 0 = Normal, 1 = Grande, 2 = Extra Grande

    public static boolean isDarkMode(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getBoolean(KEY_DARK_MODE, false);
    }

    public static void setDarkMode(Context context, boolean enabled) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean(KEY_DARK_MODE, enabled).apply();
        AppCompatDelegate.setDefaultNightMode(
                enabled ? AppCompatDelegate.MODE_NIGHT_YES : AppCompatDelegate.MODE_NIGHT_NO
        );
    }

    public static void applySavedTheme(Context context) {
        boolean dark = isDarkMode(context);
        AppCompatDelegate.setDefaultNightMode(
                dark ? AppCompatDelegate.MODE_NIGHT_YES : AppCompatDelegate.MODE_NIGHT_NO
        );
    }

    public static int getTextSizeLevel(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getInt(KEY_TEXT_SCALE, 0);
    }

    public static int cycleTextSizeLevel(Context context) {
        int next = (getTextSizeLevel(context) + 1) % 3;
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putInt(KEY_TEXT_SCALE, next).apply();
        return next;
    }

    public static float getFontScaleMultiplier(Context context) {
        int level = getTextSizeLevel(context);
        if (level == 1) return 1.15f;
        if (level == 2) return 1.30f;
        return 1.0f;
    }
}
