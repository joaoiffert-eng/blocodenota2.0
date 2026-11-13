import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_DIR = path.resolve('android-studio-project');

// Limpar diretório anterior para evitar arquivos órfãos
if (fs.existsSync(BASE_DIR)) {
  fs.rmSync(BASE_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BASE_DIR, { recursive: true });

// -----------------------------------------------------------------------------
// 1. GERAR ÍCONES PNG PARA MIPMAP (API 24-25 + Fallback Universal)
// -----------------------------------------------------------------------------
async function generateMipmapIcons() {
  const svgBuffer = fs.readFileSync(path.resolve('public/icon.svg'));
  const densities = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
  ];

  const binaryAssets = [];

  for (const d of densities) {
    const outDir = path.join(BASE_DIR, 'app/src/main/res', d.folder);
    fs.mkdirSync(outDir, { recursive: true });

    // Quadrado com cantos arredondados (ic_launcher.png)
    const iconBuf = await sharp(svgBuffer).resize(d.size, d.size).png().toBuffer();
    fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), iconBuf);
    binaryAssets.push({
      path: `app/src/main/res/${d.folder}/ic_launcher.png`,
      base64: iconBuf.toString('base64'),
    });

    // Circular (ic_launcher_round.png)
    const circleMask = Buffer.from(
      `<svg width="${d.size}" height="${d.size}"><circle cx="${d.size / 2}" cy="${d.size / 2}" r="${d.size / 2}" fill="#fff"/></svg>`
    );
    const roundBuf = await sharp(iconBuf)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), roundBuf);
    binaryAssets.push({
      path: `app/src/main/res/${d.folder}/ic_launcher_round.png`,
      base64: roundBuf.toString('base64'),
    });
  }

  return binaryAssets;
}

// -----------------------------------------------------------------------------
// 2. DEFINIR TODOS OS ARQUIVOS DO PROJETO ANDROID STUDIO (JAVA + XML + GRADLE)
// -----------------------------------------------------------------------------
const androidFiles = [
  // ===========================================================================
  // GRADLE & CONFIGURAÇÕES DO PROJETO
  // ===========================================================================
  {
    name: 'settings.gradle',
    path: 'settings.gradle',
    language: 'groovy',
    category: 'android_config',
    description: 'Configuração raiz dos repositórios (Google/Maven) e inclusão do módulo :app',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "BlocoDeNotas"
include ':app'
`
  },
  {
    name: 'build.gradle (Project)',
    path: 'build.gradle',
    language: 'groovy',
    category: 'android_config',
    description: 'Build script raiz definindo o Android Gradle Plugin 8.5.2 (compatível com JDK 17 e 21)',
    content: `// Arquivo de configuração de nível superior do projeto Android Studio.
plugins {
    id 'com.android.application' version '8.5.2' apply false
}
`
  },
  {
    name: 'gradle.properties',
    path: 'gradle.properties',
    language: 'groovy',
    category: 'android_config',
    description: 'Propriedades do Gradle, memória JVM e habilitação do AndroidX',
    content: `# Configurações do Gradle para Android Studio
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`
  },
  {
    name: 'gradle-wrapper.properties',
    path: 'gradle/wrapper/gradle-wrapper.properties',
    language: 'groovy',
    category: 'android_config',
    description: 'Wrapper do Gradle 8.7 para sincronização automática no Android Studio',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  },
  {
    name: '.gitignore',
    path: '.gitignore',
    language: 'groovy',
    category: 'android_config',
    description: 'Arquivos ignorados padrão de projetos Android Studio',
    content: `*.iml
.gradle
/local.properties
/.idea/
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
`
  },
  {
    name: 'build.gradle (:app)',
    path: 'app/build.gradle',
    language: 'groovy',
    category: 'android_config',
    description: 'Configuração do módulo :app, SDK 34 e dependências Material Design + RecyclerView',
    content: `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.blocodenotas.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.blocodenotas.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'com.google.android.material:material:1.12.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    implementation 'androidx.cardview:cardview:1.0.0'
    implementation 'androidx.coordinatorlayout:coordinatorlayout:1.2.0'
}
`
  },
  {
    name: 'proguard-rules.pro',
    path: 'app/proguard-rules.pro',
    language: 'groovy',
    category: 'android_config',
    description: 'Regras de ofuscação ProGuard/R8 para build de release',
    content: `# Regras do ProGuard para Bloco de Notas
-keep class com.blocodenotas.app.model.** { *; }
`
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    category: 'android_config',
    description: 'Manifesto oficial (AGP 8+ compatível) registrando ícone, tema e as 3 Activities',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BlocoDeNotas"
        tools:targetApi="31">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".NoteEditorActivity"
            android:exported="false"
            android:label="@string/title_editor"
            android:windowSoftInputMode="adjustResize" />

        <activity
            android:name=".NoteViewerActivity"
            android:exported="false"
            android:label="@string/title_viewer" />

    </application>

</manifest>
`
  },

  // ===========================================================================
  // CÓDIGO JAVA (MODEL, DATABASE, PREFS, ADAPTER, ACTIVITIES)
  // ===========================================================================
  {
    name: 'Note.java',
    path: 'app/src/main/java/com/blocodenotas/app/model/Note.java',
    language: 'java',
    category: 'android_java',
    description: 'Modelo da anotação com categoria (estudos, trabalho, pessoal), favorito, fixado e datas',
    content: `package com.blocodenotas.app.model;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class Note implements Serializable {
    private long id;
    private String title;
    private String content;
    private String category; // "estudos", "trabalho", "pessoal"
    private boolean isFavorite;
    private boolean isPinned;
    private long createdAt;
    private long updatedAt;

    public Note() {
        long now = System.currentTimeMillis();
        this.createdAt = now;
        this.updatedAt = now;
        this.category = "estudos";
        this.isFavorite = false;
        this.isPinned = false;
    }

    public Note(String title, String content, String category) {
        this();
        this.title = title;
        this.content = content;
        this.category = category;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTitle() {
        return title != null ? title : "";
    }

    public void setTitle(String title) {
        this.title = title;
        this.updatedAt = System.currentTimeMillis();
    }

    public String getContent() {
        return content != null ? content : "";
    }

    public void setContent(String content) {
        this.content = content;
        this.updatedAt = System.currentTimeMillis();
    }

    public String getCategory() {
        return category != null ? category : "estudos";
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    public void setFavorite(boolean favorite) {
        isFavorite = favorite;
    }

    public boolean isPinned() {
        return isPinned;
    }

    public void setPinned(boolean pinned) {
        isPinned = pinned;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getFormattedDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm", new Locale("pt", "BR"));
        return sdf.format(new Date(this.updatedAt));
    }

    public String getFormattedCreatedDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy", new Locale("pt", "BR"));
        return sdf.format(new Date(this.createdAt));
    }

    public int getWordCount() {
        String text = getContent().trim();
        if (text.isEmpty()) return 0;
        return text.split("\\\\s+").length;
    }

    public int getReadTimeMinutes() {
        return Math.max(1, (int) Math.ceil(getWordCount() / 200.0));
    }
}
`
  },
  {
    name: 'NoteDatabaseHelper.java',
    path: 'app/src/main/java/com/blocodenotas/app/database/NoteDatabaseHelper.java',
    language: 'java',
    category: 'android_java',
    description: 'Banco SQLite local 100% offline com CRUD completo, contadores, fixados e notas de exemplo',
    content: `package com.blocodenotas.app.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import com.blocodenotas.app.model.Note;

import java.util.ArrayList;
import java.util.List;

public class NoteDatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "bloco_de_notas.db";
    private static final int DATABASE_VERSION = 1;

    public static final String TABLE_NOTES = "notes";
    public static final String COLUMN_ID = "_id";
    public static final String COLUMN_TITLE = "title";
    public static final String COLUMN_CONTENT = "content";
    public static final String COLUMN_CATEGORY = "category";
    public static final String COLUMN_IS_FAVORITE = "is_favorite";
    public static final String COLUMN_IS_PINNED = "is_pinned";
    public static final String COLUMN_CREATED_AT = "created_at";
    public static final String COLUMN_UPDATED_AT = "updated_at";

    private static final String TABLE_CREATE =
            "CREATE TABLE " + TABLE_NOTES + " (" +
                    COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    COLUMN_TITLE + " TEXT NOT NULL, " +
                    COLUMN_CONTENT + " TEXT, " +
                    COLUMN_CATEGORY + " TEXT DEFAULT 'estudos', " +
                    COLUMN_IS_FAVORITE + " INTEGER DEFAULT 0, " +
                    COLUMN_IS_PINNED + " INTEGER DEFAULT 0, " +
                    COLUMN_CREATED_AT + " INTEGER, " +
                    COLUMN_UPDATED_AT + " INTEGER);";

    public NoteDatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(TABLE_CREATE);

        long now = System.currentTimeMillis();
        insertSample(db,
                "Resumo de Biologia: Estrutura e Função Celular",
                "Principais conceitos para a prova da próxima semana:\\n\\n" +
                        "1. Membrana Plasmática:\\n" +
                        "   • Bicamada fosfolipídica com proteínas integradas.\\n" +
                        "   • Permeabilidade seletiva (transporte passivo vs. ativo).\\n\\n" +
                        "2. Mitocôndrias:\\n" +
                        "   • Respiração celular e geração de ATP (energia).\\n" +
                        "   • Possuem DNA próprio.\\n\\n" +
                        "3. Retículo Endoplasmático e Complexo de Golgi:\\n" +
                        "   • RER: síntese de proteínas.\\n" +
                        "   • Golgi: empacotamento e secreção celular.\\n\\n" +
                        "📌 Dica do professor: revisar o ciclo de Krebs!",
                "estudos", 1, 1, now - 3600000L * 4);

        insertSample(db,
                "Planejamento do Projeto: Lançamento Q4",
                "Metas e entregáveis prioritários para a equipe:\\n\\n" +
                        "[✓] Alinhamento inicial de escopo com a equipe\\n" +
                        "[✓] Validação dos requisitos de acessibilidade e usabilidade\\n" +
                        "[ ] Desenho da interface com paleta moderna (azul, verde e lilás)\\n" +
                        "[ ] Revisão de desempenho e testes offline\\n" +
                        "[ ] Apresentação na sexta-feira às 14h",
                "trabalho", 1, 0, now - 3600000L * 8);

        insertSample(db,
                "Livros para Ler & Hábitos Saudáveis",
                "Minha lista de desenvolvimento pessoal:\\n\\n" +
                        "📚 Leituras recomendadas:\\n" +
                        "• \\"Hábitos Atômicos\\" – James Clear\\n" +
                        "• \\"O Homem que Calculava\\" – Malba Tahan\\n" +
                        "• \\"Essencialismo\\" – Greg McKeown\\n\\n" +
                        "🌿 Hábitos diários:\\n" +
                        "1. Tomar 2,5 litros de água.\\n" +
                        "2. Caminhada matinal de 30 minutos.\\n" +
                        "3. 15 minutos de leitura antes de dormir.",
                "pessoal", 0, 0, now - 3600000L * 24);
    }

    private void insertSample(SQLiteDatabase db, String title, String content, String category,
                              int isFavorite, int isPinned, long timestamp) {
        ContentValues cv = new ContentValues();
        cv.put(COLUMN_TITLE, title);
        cv.put(COLUMN_CONTENT, content);
        cv.put(COLUMN_CATEGORY, category);
        cv.put(COLUMN_IS_FAVORITE, isFavorite);
        cv.put(COLUMN_IS_PINNED, isPinned);
        cv.put(COLUMN_CREATED_AT, timestamp);
        cv.put(COLUMN_UPDATED_AT, timestamp);
        db.insert(TABLE_NOTES, null, cv);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_NOTES);
        onCreate(db);
    }

    public long insertNote(Note note) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_TITLE, note.getTitle());
        values.put(COLUMN_CONTENT, note.getContent());
        values.put(COLUMN_CATEGORY, note.getCategory());
        values.put(COLUMN_IS_FAVORITE, note.isFavorite() ? 1 : 0);
        values.put(COLUMN_IS_PINNED, note.isPinned() ? 1 : 0);
        values.put(COLUMN_CREATED_AT, note.getCreatedAt());
        values.put(COLUMN_UPDATED_AT, note.getUpdatedAt());

        long id = db.insert(TABLE_NOTES, null, values);
        note.setId(id);
        db.close();
        return id;
    }

    public int updateNote(Note note) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_TITLE, note.getTitle());
        values.put(COLUMN_CONTENT, note.getContent());
        values.put(COLUMN_CATEGORY, note.getCategory());
        values.put(COLUMN_IS_FAVORITE, note.isFavorite() ? 1 : 0);
        values.put(COLUMN_IS_PINNED, note.isPinned() ? 1 : 0);
        values.put(COLUMN_UPDATED_AT, System.currentTimeMillis());

        int rows = db.update(TABLE_NOTES, values, COLUMN_ID + " = ?",
                new String[]{String.valueOf(note.getId())});
        db.close();
        return rows;
    }

    public void deleteNote(long id) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_NOTES, COLUMN_ID + " = ?", new String[]{String.valueOf(id)});
        db.close();
    }

    public void toggleFavorite(long id, boolean isFavorite) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_IS_FAVORITE, isFavorite ? 1 : 0);
        values.put(COLUMN_UPDATED_AT, System.currentTimeMillis());
        db.update(TABLE_NOTES, values, COLUMN_ID + " = ?", new String[]{String.valueOf(id)});
        db.close();
    }

    public void togglePin(long id, boolean isPinned) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_IS_PINNED, isPinned ? 1 : 0);
        values.put(COLUMN_UPDATED_AT, System.currentTimeMillis());
        db.update(TABLE_NOTES, values, COLUMN_ID + " = ?", new String[]{String.valueOf(id)});
        db.close();
    }

    public Note getNoteById(long id) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_NOTES, null, COLUMN_ID + " = ?",
                new String[]{String.valueOf(id)}, null, null, null);
        Note note = null;
        if (cursor != null) {
            if (cursor.moveToFirst()) {
                note = cursorToNote(cursor);
            }
            cursor.close();
        }
        db.close();
        return note;
    }

    public List<Note> getNotes(String categoryFilter, boolean onlyFavorites, String searchQuery) {
        List<Note> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        StringBuilder query = new StringBuilder("SELECT * FROM " + TABLE_NOTES + " WHERE 1=1");
        List<String> args = new ArrayList<>();

        if (onlyFavorites) {
            query.append(" AND ").append(COLUMN_IS_FAVORITE).append(" = 1");
        } else if (categoryFilter != null && !categoryFilter.equals("todas")) {
            query.append(" AND ").append(COLUMN_CATEGORY).append(" = ?");
            args.add(categoryFilter);
        }

        if (searchQuery != null && !searchQuery.trim().isEmpty()) {
            query.append(" AND (").append(COLUMN_TITLE).append(" LIKE ? OR ")
                    .append(COLUMN_CONTENT).append(" LIKE ?)");
            String pattern = "%" + searchQuery.trim() + "%";
            args.add(pattern);
            args.add(pattern);
        }

        query.append(" ORDER BY ").append(COLUMN_IS_PINNED).append(" DESC, ")
                .append(COLUMN_UPDATED_AT).append(" DESC");

        Cursor cursor = db.rawQuery(query.toString(), args.toArray(new String[0]));

        if (cursor.moveToFirst()) {
            do {
                list.add(cursorToNote(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        db.close();
        return list;
    }

    public int getTotalCount() {
        return getCount("SELECT COUNT(*) FROM " + TABLE_NOTES, null);
    }

    public int getCategoryCount(String category) {
        return getCount("SELECT COUNT(*) FROM " + TABLE_NOTES + " WHERE " + COLUMN_CATEGORY + " = ?",
                new String[]{category});
    }

    public int getFavoritesCount() {
        return getCount("SELECT COUNT(*) FROM " + TABLE_NOTES + " WHERE " + COLUMN_IS_FAVORITE + " = 1", null);
    }

    private int getCount(String sql, String[] args) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery(sql, args);
        int count = 0;
        if (cursor.moveToFirst()) {
            count = cursor.getInt(0);
        }
        cursor.close();
        db.close();
        return count;
    }

    private Note cursorToNote(Cursor cursor) {
        Note note = new Note();
        note.setId(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_ID)));
        note.setTitle(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TITLE)));
        note.setContent(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_CONTENT)));
        note.setCategory(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_CATEGORY)));
        note.setFavorite(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_IS_FAVORITE)) == 1);
        note.setPinned(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_IS_PINNED)) == 1);
        note.setCreatedAt(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_CREATED_AT)));
        note.setUpdatedAt(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_UPDATED_AT)));
        return note;
    }
}
`
  },
  {
    name: 'PrefsManager.java',
    path: 'app/src/main/java/com/blocodenotas/app/utils/PrefsManager.java',
    language: 'java',
    category: 'android_java',
    description: 'Preferências locais (Modo Escuro persistente e tamanho de fonte acessível)',
    content: `package com.blocodenotas.app.utils;

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
`
  },
  {
    name: 'NoteAdapter.java',
    path: 'app/src/main/java/com/blocodenotas/app/adapter/NoteAdapter.java',
    language: 'java',
    category: 'android_java',
    description: 'Adapter dos cartões modernos com cores Azul/Verde/Lilás, fixar, favoritos e ações',
    content: `package com.blocodenotas.app.adapter;

import android.content.Context;
import android.content.res.ColorStateList;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.core.view.ViewCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.blocodenotas.app.R;
import com.blocodenotas.app.model.Note;
import com.blocodenotas.app.utils.PrefsManager;

import java.util.ArrayList;
import java.util.List;

public class NoteAdapter extends RecyclerView.Adapter<NoteAdapter.NoteViewHolder> {

    public interface OnNoteClickListener {
        void onNoteClick(Note note);
        void onNoteEdit(Note note);
        void onNoteDelete(Note note);
        void onNoteFavoriteToggle(Note note);
        void onNotePinToggle(Note note);
    }

    private final Context context;
    private final OnNoteClickListener listener;
    private List<Note> notes = new ArrayList<>();

    public NoteAdapter(Context context, OnNoteClickListener listener) {
        this.context = context;
        this.listener = listener;
    }

    public void setNotes(List<Note> notes) {
        this.notes = notes != null ? notes : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public NoteViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_note, parent, false);
        return new NoteViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull NoteViewHolder holder, int position) {
        Note note = notes.get(position);
        holder.bind(context, note, listener);
    }

    @Override
    public int getItemCount() {
        return notes.size();
    }

    static class NoteViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvTitle, tvContentPreview, tvCategory, tvPinnedBadge, tvDate;
        private final ImageButton btnFavorite, btnPin, btnView, btnEdit, btnDelete;

        public NoteViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvContentPreview = itemView.findViewById(R.id.tvContentPreview);
            tvCategory = itemView.findViewById(R.id.tvCategory);
            tvPinnedBadge = itemView.findViewById(R.id.tvPinnedBadge);
            tvDate = itemView.findViewById(R.id.tvDate);
            btnFavorite = itemView.findViewById(R.id.btnFavorite);
            btnPin = itemView.findViewById(R.id.btnPin);
            btnView = itemView.findViewById(R.id.btnView);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }

        public void bind(Context context, Note note, OnNoteClickListener listener) {
            float fontScale = PrefsManager.getFontScaleMultiplier(context);

            tvTitle.setText(note.getTitle());
            tvTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f * fontScale);

            String preview = note.getContent().trim();
            tvContentPreview.setText(preview.isEmpty() ? "(Sem conteúdo adicional)" : preview);
            tvContentPreview.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13.5f * fontScale);

            tvDate.setText(note.getFormattedDate());

            // Cores harmônicas por categoria: Estudos (Azul), Trabalho (Verde), Pessoal (Lilás)
            int bgColor;
            int textColor;
            String label;
            switch (note.getCategory().toLowerCase()) {
                case "trabalho":
                    label = context.getString(R.string.category_work);
                    bgColor = ContextCompat.getColor(context, R.color.tag_work_bg);
                    textColor = ContextCompat.getColor(context, R.color.tag_work_text);
                    break;
                case "pessoal":
                    label = context.getString(R.string.category_personal);
                    bgColor = ContextCompat.getColor(context, R.color.tag_personal_bg);
                    textColor = ContextCompat.getColor(context, R.color.tag_personal_text);
                    break;
                default:
                    label = context.getString(R.string.category_studies);
                    bgColor = ContextCompat.getColor(context, R.color.tag_studies_bg);
                    textColor = ContextCompat.getColor(context, R.color.tag_studies_text);
                    break;
            }
            tvCategory.setText(label);
            tvCategory.setTextColor(textColor);
            ViewCompat.setBackgroundTintList(tvCategory, ColorStateList.valueOf(bgColor));

            // Badge Fixada
            tvPinnedBadge.setVisibility(note.isPinned() ? View.VISIBLE : View.GONE);

            // Ícone Fixar
            if (note.isPinned()) {
                btnPin.setColorFilter(ContextCompat.getColor(context, R.color.primary_blue));
            } else {
                btnPin.setColorFilter(ContextCompat.getColor(context, R.color.icon_muted));
            }

            // Ícone Favorito
            if (note.isFavorite()) {
                btnFavorite.setImageResource(R.drawable.ic_star_filled);
                btnFavorite.setColorFilter(ContextCompat.getColor(context, R.color.favorite_yellow));
            } else {
                btnFavorite.setImageResource(R.drawable.ic_star_outline);
                btnFavorite.setColorFilter(ContextCompat.getColor(context, R.color.icon_muted));
            }

            // Listeners de clique
            itemView.setOnClickListener(v -> listener.onNoteClick(note));
            btnView.setOnClickListener(v -> listener.onNoteClick(note));
            btnEdit.setOnClickListener(v -> listener.onNoteEdit(note));
            btnDelete.setOnClickListener(v -> listener.onNoteDelete(note));
            btnFavorite.setOnClickListener(v -> listener.onNoteFavoriteToggle(note));
            btnPin.setOnClickListener(v -> listener.onNotePinToggle(note));
        }
    }
}
`
  },
  {
    name: 'MainActivity.java',
    path: 'app/src/main/java/com/blocodenotas/app/MainActivity.java',
    language: 'java',
    category: 'android_java',
    description: 'Tela principal com pesquisa instantânea, barra inferior só com nomes, modo escuro e tamanho de fonte',
    content: `package com.blocodenotas.app;

import android.content.Intent;
import android.content.res.ColorStateList;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.view.ViewCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.blocodenotas.app.adapter.NoteAdapter;
import com.blocodenotas.app.database.NoteDatabaseHelper;
import com.blocodenotas.app.model.Note;
import com.blocodenotas.app.utils.PrefsManager;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

public class MainActivity extends AppCompatActivity implements NoteAdapter.OnNoteClickListener {

    private RecyclerView recyclerView;
    private NoteAdapter adapter;
    private NoteDatabaseHelper dbHelper;
    private EditText etSearch;
    private ImageButton btnClearSearch, btnToggleTheme, btnTextSize, btnExit;
    private LinearLayout emptyStateView;
    private TextView tvEmptyTitle, tvEmptySubtitle;
    private FloatingActionButton fabNewNote;

    // Botões de navegação inferior (apenas nomes e contadores, sem ícones)
    private TextView tabAll, tabStudies, tabWork, tabPersonal, tabFavorites;

    private String currentCategory = "todas";
    private boolean isFavoritesOnly = false;
    private String currentSearchText = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        PrefsManager.applySavedTheme(this);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        dbHelper = new NoteDatabaseHelper(this);

        initViews();
        setupRecyclerView();
        setupListeners();
        updateThemeIcon();
        loadNotes();

        // Interceptar botão voltar do sistema para confirmar saída
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                showExitConfirmationDialog();
            }
        });
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerViewNotes);
        etSearch = findViewById(R.id.etSearch);
        btnClearSearch = findViewById(R.id.btnClearSearch);
        btnToggleTheme = findViewById(R.id.btnToggleTheme);
        btnTextSize = findViewById(R.id.btnTextSize);
        btnExit = findViewById(R.id.btnExit);
        emptyStateView = findViewById(R.id.emptyStateView);
        tvEmptyTitle = findViewById(R.id.tvEmptyTitle);
        tvEmptySubtitle = findViewById(R.id.tvEmptySubtitle);
        fabNewNote = findViewById(R.id.fabNewNote);

        tabAll = findViewById(R.id.tabAll);
        tabStudies = findViewById(R.id.tabStudies);
        tabWork = findViewById(R.id.tabWork);
        tabPersonal = findViewById(R.id.tabPersonal);
        tabFavorites = findViewById(R.id.tabFavorites);
    }

    private void setupRecyclerView() {
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new NoteAdapter(this, this);
        recyclerView.setAdapter(adapter);
    }

    private void setupListeners() {
        // Botão Flutuante: Nova Anotação
        fabNewNote.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, NoteEditorActivity.class);
            startActivity(intent);
        });

        // Pesquisa em tempo real
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentSearchText = s.toString();
                btnClearSearch.setVisibility(currentSearchText.isEmpty() ? View.GONE : View.VISIBLE);
                loadNotes();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnClearSearch.setOnClickListener(v -> etSearch.setText(""));

        // Navegação inferior por categorias (somente nomes)
        tabAll.setOnClickListener(v -> selectFilter("todas", false));
        tabStudies.setOnClickListener(v -> selectFilter("estudos", false));
        tabWork.setOnClickListener(v -> selectFilter("trabalho", false));
        tabPersonal.setOnClickListener(v -> selectFilter("pessoal", false));
        tabFavorites.setOnClickListener(v -> selectFilter("todas", true));

        // Alternar Tamanho de Fonte (Acessibilidade)
        btnTextSize.setOnClickListener(v -> {
            int level = PrefsManager.cycleTextSizeLevel(this);
            String label = level == 1 ? "Texto ampliado (Grande)"
                    : level == 2 ? "Texto ampliado (Extra Grande)"
                    : "Tamanho normal de texto";
            Toast.makeText(this, label, Toast.LENGTH_SHORT).show();
            adapter.notifyDataSetChanged();
        });

        // Alternar Modo Escuro
        btnToggleTheme.setOnClickListener(v -> {
            boolean nextDark = !PrefsManager.isDarkMode(this);
            PrefsManager.setDarkMode(this, nextDark);
            Toast.makeText(this, nextDark ? "Modo escuro ativado" : "Modo claro ativado", Toast.LENGTH_SHORT).show();
        });

        // Sair com confirmação
        btnExit.setOnClickListener(v -> showExitConfirmationDialog());
    }

    private void selectFilter(String category, boolean favoritesOnly) {
        currentCategory = category;
        isFavoritesOnly = favoritesOnly;
        loadNotes();
    }

    private void updateThemeIcon() {
        boolean isDark = PrefsManager.isDarkMode(this);
        btnToggleTheme.setImageResource(isDark ? R.drawable.ic_sun : R.drawable.ic_moon);
        btnToggleTheme.setColorFilter(ContextCompat.getColor(this,
                isDark ? R.color.favorite_yellow : R.color.personal_purple));
    }

    private void loadNotes() {
        List<Note> notes = dbHelper.getNotes(currentCategory, isFavoritesOnly, currentSearchText);
        adapter.setNotes(notes);
        updateCategoryTabs();

        if (notes.isEmpty()) {
            recyclerView.setVisibility(View.GONE);
            emptyStateView.setVisibility(View.VISIBLE);
            if (!currentSearchText.trim().isEmpty()) {
                tvEmptyTitle.setText("Nenhum resultado encontrado");
                tvEmptySubtitle.setText("Tente buscar por outra palavra ou limpe a pesquisa.");
            } else if (isFavoritesOnly) {
                tvEmptyTitle.setText("Sem favoritos ainda");
                tvEmptySubtitle.setText("Toque na estrela ★ de uma anotação para marcá-la aqui.");
            } else {
                tvEmptyTitle.setText("Nenhuma anotação por aqui");
                tvEmptySubtitle.setText("Toque no botão + para criar sua primeira anotação!");
            }
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            emptyStateView.setVisibility(View.GONE);
        }
    }

    private void updateCategoryTabs() {
        int allCount = dbHelper.getTotalCount();
        int studiesCount = dbHelper.getCategoryCount("estudos");
        int workCount = dbHelper.getCategoryCount("trabalho");
        int personalCount = dbHelper.getCategoryCount("pessoal");
        int favCount = dbHelper.getFavoritesCount();

        tabAll.setText("Início (" + allCount + ")");
        tabStudies.setText("Estudos (" + studiesCount + ")");
        tabWork.setText("Trabalho (" + workCount + ")");
        tabPersonal.setText("Pessoal (" + personalCount + ")");
        tabFavorites.setText("Favoritos (" + favCount + ")");

        styleTab(tabAll, !isFavoritesOnly && currentCategory.equals("todas"), R.color.tab_all_active);
        styleTab(tabStudies, !isFavoritesOnly && currentCategory.equals("estudos"), R.color.primary_blue);
        styleTab(tabWork, !isFavoritesOnly && currentCategory.equals("trabalho"), R.color.work_green);
        styleTab(tabPersonal, !isFavoritesOnly && currentCategory.equals("pessoal"), R.color.personal_purple);
        styleTab(tabFavorites, isFavoritesOnly, R.color.favorite_yellow);
    }

    private void styleTab(TextView tab, boolean isActive, int activeBgColorRes) {
        if (isActive) {
            int bgColor = ContextCompat.getColor(this, activeBgColorRes);
            int textColor = ContextCompat.getColor(this, R.color.tab_active_text);
            ViewCompat.setBackgroundTintList(tab, ColorStateList.valueOf(bgColor));
            tab.setTextColor(textColor);
            tab.setTypeface(null, android.graphics.Typeface.BOLD);
        } else {
            int bgColor = ContextCompat.getColor(this, R.color.tab_inactive_bg);
            int textColor = ContextCompat.getColor(this, R.color.text_secondary);
            ViewCompat.setBackgroundTintList(tab, ColorStateList.valueOf(bgColor));
            tab.setTextColor(textColor);
            tab.setTypeface(null, android.graphics.Typeface.NORMAL);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadNotes();
    }

    @Override
    public void onNoteClick(Note note) {
        Intent intent = new Intent(this, NoteViewerActivity.class);
        intent.putExtra("note_id", note.getId());
        startActivity(intent);
    }

    @Override
    public void onNoteEdit(Note note) {
        Intent intent = new Intent(this, NoteEditorActivity.class);
        intent.putExtra("note_id", note.getId());
        startActivity(intent);
    }

    @Override
    public void onNoteDelete(Note note) {
        new AlertDialog.Builder(this)
                .setTitle("Excluir Anotação")
                .setMessage("Tem certeza de que deseja excluir permanentemente \\"" + note.getTitle() + "\\"?")
                .setPositiveButton("Excluir", (dialog, which) -> {
                    dbHelper.deleteNote(note.getId());
                    loadNotes();
                    Toast.makeText(this, "Anotação excluída.", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    @Override
    public void onNoteFavoriteToggle(Note note) {
        boolean nextState = !note.isFavorite();
        dbHelper.toggleFavorite(note.getId(), nextState);
        Toast.makeText(this, nextState ? "Adicionada aos favoritos" : "Removida dos favoritos", Toast.LENGTH_SHORT).show();
        loadNotes();
    }

    @Override
    public void onNotePinToggle(Note note) {
        boolean nextState = !note.isPinned();
        dbHelper.togglePin(note.getId(), nextState);
        Toast.makeText(this, nextState ? "Fixada no topo" : "Desafixada", Toast.LENGTH_SHORT).show();
        loadNotes();
    }

    private void showExitConfirmationDialog() {
        int total = dbHelper.getTotalCount();
        new AlertDialog.Builder(this)
                .setTitle("Sair do Bloco de Notas")
                .setMessage("Deseja sair do aplicativo? Suas " + total + " anotações estão salvas com segurança no dispositivo.")
                .setPositiveButton("Confirmar e Sair", (dialog, which) -> finish())
                .setNegativeButton("Continuar no App", null)
                .show();
    }
}
`
  },
  {
    name: 'NoteEditorActivity.java',
    path: 'app/src/main/java/com/blocodenotas/app/NoteEditorActivity.java',
    language: 'java',
    category: 'android_java',
    description: 'Tela de criação e edição com seletor visual de categorias (Azul, Verde, Lilás), favoritos, fixar e formatação',
    content: `package com.blocodenotas.app;

import android.content.res.ColorStateList;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.TypedValue;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.view.ViewCompat;

import com.blocodenotas.app.database.NoteDatabaseHelper;
import com.blocodenotas.app.model.Note;
import com.blocodenotas.app.utils.PrefsManager;

public class NoteEditorActivity extends AppCompatActivity {

    private EditText etTitle, etContent;
    private LinearLayout cardCatStudies, cardCatWork, cardCatPersonal;
    private TextView tvWordCounter;
    private ImageButton btnPinEditor, btnFavEditor;
    private Button btnBack, btnSave;
    private Button btnFmtBold, btnFmtHeading, btnFmtBullet, btnFmtCheck;

    private NoteDatabaseHelper dbHelper;
    private Note currentNote;
    private boolean isEditing = false;

    private String selectedCategory = "estudos";
    private boolean isFavorite = false;
    private boolean isPinned = false;

    private String originalTitle = "";
    private String originalContent = "";
    private String originalCategory = "estudos";
    private boolean originalFavorite = false;
    private boolean originalPinned = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        PrefsManager.applySavedTheme(this);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_editor);

        dbHelper = new NoteDatabaseHelper(this);
        initViews();

        long noteId = getIntent().getLongExtra("note_id", -1);
        if (noteId != -1) {
            isEditing = true;
            loadNoteData(noteId);
        } else {
            etTitle.requestFocus();
        }

        applyTextScaling();
        updateCategoryCardsUI();
        updateTopTogglesUI();
        updateCounter();
        setupListeners();

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                handleBackWithConfirmation();
            }
        });
    }

    private void initViews() {
        etTitle = findViewById(R.id.etTitle);
        etContent = findViewById(R.id.etContent);
        cardCatStudies = findViewById(R.id.cardCatStudies);
        cardCatWork = findViewById(R.id.cardCatWork);
        cardCatPersonal = findViewById(R.id.cardCatPersonal);
        tvWordCounter = findViewById(R.id.tvWordCounter);
        btnPinEditor = findViewById(R.id.btnPinEditor);
        btnFavEditor = findViewById(R.id.btnFavEditor);
        btnBack = findViewById(R.id.btnBack);
        btnSave = findViewById(R.id.btnSave);
        btnFmtBold = findViewById(R.id.btnFmtBold);
        btnFmtHeading = findViewById(R.id.btnFmtHeading);
        btnFmtBullet = findViewById(R.id.btnFmtBullet);
        btnFmtCheck = findViewById(R.id.btnFmtCheck);
    }

    private void applyTextScaling() {
        float scale = PrefsManager.getFontScaleMultiplier(this);
        etTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f * scale);
        etContent.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15.5f * scale);
    }

    private void loadNoteData(long noteId) {
        Note n = dbHelper.getNoteById(noteId);
        if (n != null) {
            currentNote = n;
            originalTitle = n.getTitle();
            originalContent = n.getContent();
            originalCategory = n.getCategory();
            originalFavorite = n.isFavorite();
            originalPinned = n.isPinned();

            etTitle.setText(originalTitle);
            etContent.setText(originalContent);
            selectedCategory = originalCategory;
            isFavorite = originalFavorite;
            isPinned = originalPinned;
        }
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> handleBackWithConfirmation());
        btnSave.setOnClickListener(v -> saveNote());

        cardCatStudies.setOnClickListener(v -> {
            selectedCategory = "estudos";
            updateCategoryCardsUI();
        });
        cardCatWork.setOnClickListener(v -> {
            selectedCategory = "trabalho";
            updateCategoryCardsUI();
        });
        cardCatPersonal.setOnClickListener(v -> {
            selectedCategory = "pessoal";
            updateCategoryCardsUI();
        });

        btnFavEditor.setOnClickListener(v -> {
            isFavorite = !isFavorite;
            updateTopTogglesUI();
        });

        btnPinEditor.setOnClickListener(v -> {
            isPinned = !isPinned;
            updateTopTogglesUI();
        });

        etContent.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                updateCounter();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Ferramentas rápidas de texto
        btnFmtHeading.setOnClickListener(v -> insertAtCursor("# "));
        btnFmtBold.setOnClickListener(v -> wrapSelection("**", "**"));
        btnFmtBullet.setOnClickListener(v -> insertAtCursor("• "));
        btnFmtCheck.setOnClickListener(v -> insertAtCursor("[ ] "));
    }

    private void insertAtCursor(String prefix) {
        int start = Math.max(0, etContent.getSelectionStart());
        Editable editable = etContent.getText();
        if (editable != null) {
            editable.insert(start, prefix);
            etContent.requestFocus();
        }
    }

    private void wrapSelection(String before, String after) {
        int start = Math.max(0, etContent.getSelectionStart());
        int end = Math.max(0, etContent.getSelectionEnd());
        if (start > end) {
            int tmp = start;
            start = end;
            end = tmp;
        }
        Editable editable = etContent.getText();
        if (editable != null) {
            editable.insert(end, after);
            editable.insert(start, before);
            etContent.setSelection(start + before.length());
            etContent.requestFocus();
        }
    }

    private void updateCounter() {
        String text = etContent.getText() != null ? etContent.getText().toString() : "";
        String trimmed = text.trim();
        int words = trimmed.isEmpty() ? 0 : trimmed.split("\\\\s+").length;
        int chars = text.length();
        tvWordCounter.setText(words + " palavras • " + chars + " caracteres");
    }

    private void updateCategoryCardsUI() {
        styleCategoryCard(cardCatStudies, selectedCategory.equals("estudos"), R.color.tag_studies_bg, R.color.primary_blue);
        styleCategoryCard(cardCatWork, selectedCategory.equals("trabalho"), R.color.tag_work_bg, R.color.work_green);
        styleCategoryCard(cardCatPersonal, selectedCategory.equals("pessoal"), R.color.tag_personal_bg, R.color.personal_purple);
    }

    private void styleCategoryCard(LinearLayout card, boolean active, int activeBgRes, int activeBorderRes) {
        if (active) {
            int bg = ContextCompat.getColor(this, activeBgRes);
            ViewCompat.setBackgroundTintList(card, ColorStateList.valueOf(bg));
            card.setAlpha(1.0f);
        } else {
            int bg = ContextCompat.getColor(this, R.color.bg_search);
            ViewCompat.setBackgroundTintList(card, ColorStateList.valueOf(bg));
            card.setAlpha(0.7f);
        }
    }

    private void updateTopTogglesUI() {
        if (isFavorite) {
            btnFavEditor.setImageResource(R.drawable.ic_star_filled);
            btnFavEditor.setColorFilter(ContextCompat.getColor(this, R.color.favorite_yellow));
        } else {
            btnFavEditor.setImageResource(R.drawable.ic_star_outline);
            btnFavEditor.setColorFilter(ContextCompat.getColor(this, R.color.icon_muted));
        }

        if (isPinned) {
            btnPinEditor.setColorFilter(ContextCompat.getColor(this, R.color.primary_blue));
        } else {
            btnPinEditor.setColorFilter(ContextCompat.getColor(this, R.color.icon_muted));
        }
    }

    private void saveNote() {
        String title = etTitle.getText() != null ? etTitle.getText().toString().trim() : "";
        String content = etContent.getText() != null ? etContent.getText().toString() : "";

        if (title.isEmpty()) {
            etTitle.setError("Informe um título para salvar a anotação");
            etTitle.requestFocus();
            return;
        }

        if (isEditing && currentNote != null) {
            currentNote.setTitle(title);
            currentNote.setContent(content);
            currentNote.setCategory(selectedCategory);
            currentNote.setFavorite(isFavorite);
            currentNote.setPinned(isPinned);
            dbHelper.updateNote(currentNote);
            Toast.makeText(this, "Anotação atualizada com sucesso!", Toast.LENGTH_SHORT).show();
        } else {
            Note newNote = new Note(title, content, selectedCategory);
            newNote.setFavorite(isFavorite);
            newNote.setPinned(isPinned);
            dbHelper.insertNote(newNote);
            Toast.makeText(this, "Nova anotação salva com sucesso!", Toast.LENGTH_SHORT).show();
        }

        finish();
    }

    private boolean isDirty() {
        String title = etTitle.getText() != null ? etTitle.getText().toString().trim() : "";
        String content = etContent.getText() != null ? etContent.getText().toString() : "";
        if (!isEditing) {
            return !title.isEmpty() || !content.trim().isEmpty();
        }
        return !title.equals(originalTitle)
                || !content.equals(originalContent)
                || !selectedCategory.equals(originalCategory)
                || isFavorite != originalFavorite
                || isPinned != originalPinned;
    }

    private void handleBackWithConfirmation() {
        if (isDirty()) {
            new AlertDialog.Builder(this)
                    .setTitle("Descartar alterações?")
                    .setMessage("Você fez alterações que ainda não foram salvas. Deseja voltar sem salvar?")
                    .setPositiveButton("Descartar", (dialog, which) -> finish())
                    .setNegativeButton("Continuar Editando", null)
                    .show();
        } else {
            finish();
        }
    }
}
`
  },
  {
    name: 'NoteViewerActivity.java',
    path: 'app/src/main/java/com/blocodenotas/app/NoteViewerActivity.java',
    language: 'java',
    category: 'android_java',
    description: 'Tela de leitura completa com botões Voltar, Favoritar, Fixar, Copiar, Compartilhar, Editar e Excluir',
    content: `package com.blocodenotas.app;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.view.ViewCompat;

import com.blocodenotas.app.database.NoteDatabaseHelper;
import com.blocodenotas.app.model.Note;
import com.blocodenotas.app.utils.PrefsManager;

public class NoteViewerActivity extends AppCompatActivity {

    private TextView tvTitle, tvContent, tvCategory, tvPinnedBadge, tvDate, tvReadStats, tvCreatedDate;
    private Button btnBack, btnEdit;
    private ImageButton btnPin, btnFavorite, btnCopy, btnShare, btnDelete;
    private NoteDatabaseHelper dbHelper;
    private Note currentNote;
    private long noteId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        PrefsManager.applySavedTheme(this);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_viewer);

        dbHelper = new NoteDatabaseHelper(this);
        noteId = getIntent().getLongExtra("note_id", -1);

        initViews();
        setupListeners();
        loadNote();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadNote();
    }

    private void initViews() {
        tvTitle = findViewById(R.id.tvTitle);
        tvContent = findViewById(R.id.tvContent);
        tvCategory = findViewById(R.id.tvCategory);
        tvPinnedBadge = findViewById(R.id.tvPinnedBadge);
        tvDate = findViewById(R.id.tvDate);
        tvReadStats = findViewById(R.id.tvReadStats);
        tvCreatedDate = findViewById(R.id.tvCreatedDate);

        btnBack = findViewById(R.id.btnBack);
        btnEdit = findViewById(R.id.btnEdit);
        btnPin = findViewById(R.id.btnPin);
        btnFavorite = findViewById(R.id.btnFavorite);
        btnCopy = findViewById(R.id.btnCopy);
        btnShare = findViewById(R.id.btnShare);
        btnDelete = findViewById(R.id.btnDelete);
    }

    private void loadNote() {
        if (noteId == -1) {
            finish();
            return;
        }
        currentNote = dbHelper.getNoteById(noteId);
        if (currentNote == null) {
            finish();
            return;
        }

        float scale = PrefsManager.getFontScaleMultiplier(this);
        tvTitle.setText(currentNote.getTitle());
        tvTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f * scale);

        tvContent.setText(currentNote.getContent().isEmpty() ? "(Sem conteúdo)" : currentNote.getContent());
        tvContent.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f * scale);

        tvDate.setText("Última modificação: " + currentNote.getFormattedDate());
        tvReadStats.setText("~" + currentNote.getReadTimeMinutes() + " min leitura • " + currentNote.getWordCount() + " palavras");
        tvCreatedDate.setText("Criada em: " + currentNote.getFormattedCreatedDate());

        // Badge Categoria
        int bgColor, textColor;
        String label;
        switch (currentNote.getCategory().toLowerCase()) {
            case "trabalho":
                label = getString(R.string.category_work);
                bgColor = ContextCompat.getColor(this, R.color.tag_work_bg);
                textColor = ContextCompat.getColor(this, R.color.tag_work_text);
                break;
            case "pessoal":
                label = getString(R.string.category_personal);
                bgColor = ContextCompat.getColor(this, R.color.tag_personal_bg);
                textColor = ContextCompat.getColor(this, R.color.tag_personal_text);
                break;
            default:
                label = getString(R.string.category_studies);
                bgColor = ContextCompat.getColor(this, R.color.tag_studies_bg);
                textColor = ContextCompat.getColor(this, R.color.tag_studies_text);
                break;
        }
        tvCategory.setText(label);
        tvCategory.setTextColor(textColor);
        ViewCompat.setBackgroundTintList(tvCategory, ColorStateList.valueOf(bgColor));

        // Badge Fixada
        tvPinnedBadge.setVisibility(currentNote.isPinned() ? View.VISIBLE : View.GONE);

        // Ícones
        btnPin.setColorFilter(ContextCompat.getColor(this,
                currentNote.isPinned() ? R.color.primary_blue : R.color.icon_muted));

        if (currentNote.isFavorite()) {
            btnFavorite.setImageResource(R.drawable.ic_star_filled);
            btnFavorite.setColorFilter(ContextCompat.getColor(this, R.color.favorite_yellow));
        } else {
            btnFavorite.setImageResource(R.drawable.ic_star_outline);
            btnFavorite.setColorFilter(ContextCompat.getColor(this, R.color.icon_muted));
        }
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        btnEdit.setOnClickListener(v -> {
            Intent intent = new Intent(this, NoteEditorActivity.class);
            intent.putExtra("note_id", noteId);
            startActivity(intent);
        });

        btnPin.setOnClickListener(v -> {
            if (currentNote == null) return;
            boolean next = !currentNote.isPinned();
            dbHelper.togglePin(noteId, next);
            Toast.makeText(this, next ? "Fixada no topo" : "Desafixada", Toast.LENGTH_SHORT).show();
            loadNote();
        });

        btnFavorite.setOnClickListener(v -> {
            if (currentNote == null) return;
            boolean next = !currentNote.isFavorite();
            dbHelper.toggleFavorite(noteId, next);
            Toast.makeText(this, next ? "Adicionada aos favoritos" : "Removida dos favoritos", Toast.LENGTH_SHORT).show();
            loadNote();
        });

        btnCopy.setOnClickListener(v -> {
            if (currentNote == null) return;
            ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData clip = ClipData.newPlainText("Anotação", currentNote.getTitle() + "\\n\\n" + currentNote.getContent());
            if (clipboard != null) {
                clipboard.setPrimaryClip(clip);
                Toast.makeText(this, "Conteúdo copiado!", Toast.LENGTH_SHORT).show();
            }
        });

        btnShare.setOnClickListener(v -> {
            if (currentNote == null) return;
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, currentNote.getTitle());
            shareIntent.putExtra(Intent.EXTRA_TEXT, currentNote.getTitle() + "\\n\\n" + currentNote.getContent());
            startActivity(Intent.createChooser(shareIntent, "Compartilhar anotação via"));
        });

        btnDelete.setOnClickListener(v -> {
            if (currentNote == null) return;
            new AlertDialog.Builder(this)
                    .setTitle("Excluir Anotação")
                    .setMessage("Tem certeza de que deseja excluir \\"" + currentNote.getTitle() + "\\" permanentemente?")
                    .setPositiveButton("Excluir", (dialog, which) -> {
                        dbHelper.deleteNote(noteId);
                        Toast.makeText(this, "Anotação excluída.", Toast.LENGTH_SHORT).show();
                        finish();
                    })
                    .setNegativeButton("Cancelar", null)
                    .show();
        });
    }
}
`
  },

  // ===========================================================================
  // XML LAYOUTS, DRAWABLES, MIPMAP, VALUES & TEMAS (CLARO + ESCURO)
  // ===========================================================================
  {
    name: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Layout principal responsivo com pesquisa no topo, lista de cartões e barra inferior só com nomes',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_screen">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical">

        <!-- Cabeçalho Superior -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:background="@color/bg_surface"
            android:elevation="2dp"
            android:gravity="center_vertical"
            android:orientation="horizontal"
            android:paddingStart="16dp"
            android:paddingTop="12dp"
            android:paddingEnd="12dp"
            android:paddingBottom="12dp">

            <ImageView
                android:layout_width="36dp"
                android:layout_height="36dp"
                android:background="@drawable/bg_logo_gradient"
                android:contentDescription="@string/app_name"
                android:padding="8dp"
                android:src="@drawable/ic_book"
                app:tint="#FFFFFF" />

            <LinearLayout
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_marginStart="10dp"
                android:layout_weight="1"
                android:orientation="vertical">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="@string/app_name"
                    android:textColor="@color/text_primary"
                    android:textSize="17sp"
                    android:textStyle="bold" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="@string/app_subtitle"
                    android:textColor="@color/work_green"
                    android:textSize="11sp"
                    android:textStyle="bold" />
            </LinearLayout>

            <ImageButton
                android:id="@+id/btnTextSize"
                android:layout_width="40dp"
                android:layout_height="40dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:contentDescription="@string/cd_text_size"
                android:padding="8dp"
                android:src="@drawable/ic_text_size"
                app:tint="@color/personal_purple" />

            <ImageButton
                android:id="@+id/btnToggleTheme"
                android:layout_width="40dp"
                android:layout_height="40dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:contentDescription="@string/cd_toggle_theme"
                android:padding="8dp"
                android:src="@drawable/ic_moon" />

            <ImageButton
                android:id="@+id/btnExit"
                android:layout_width="40dp"
                android:layout_height="40dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:contentDescription="@string/cd_exit"
                android:padding="8dp"
                android:src="@drawable/ic_exit"
                app:tint="@color/danger_red" />
        </LinearLayout>

        <!-- Barra de Pesquisa -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="46dp"
            android:layout_marginStart="14dp"
            android:layout_marginTop="12dp"
            android:layout_marginEnd="14dp"
            android:layout_marginBottom="8dp"
            android:background="@drawable/bg_search_box"
            android:gravity="center_vertical"
            android:orientation="horizontal"
            android:paddingStart="14dp"
            android:paddingEnd="10dp">

            <ImageView
                android:layout_width="18dp"
                android:layout_height="18dp"
                android:contentDescription="@string/cd_search"
                android:src="@drawable/ic_search"
                app:tint="@color/text_secondary" />

            <EditText
                android:id="@+id/etSearch"
                android:layout_width="0dp"
                android:layout_height="match_parent"
                android:layout_marginStart="10dp"
                android:layout_weight="1"
                android:background="@null"
                android:hint="@string/hint_search"
                android:imeOptions="actionSearch"
                android:inputType="text"
                android:maxLines="1"
                android:textColor="@color/text_primary"
                android:textColorHint="@color/text_secondary"
                android:textSize="14sp" />

            <ImageButton
                android:id="@+id/btnClearSearch"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:contentDescription="@string/cd_clear_search"
                android:padding="6dp"
                android:src="@drawable/ic_close"
                android:visibility="gone"
                app:tint="@color/text_secondary" />
        </LinearLayout>

        <!-- Conteúdo Principal: Lista ou Estado Vazio -->
        <FrameLayout
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1">

            <androidx.recyclerview.widget.RecyclerView
                android:id="@+id/recyclerViewNotes"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:clipToPadding="false"
                android:paddingStart="14dp"
                android:paddingTop="4dp"
                android:paddingEnd="14dp"
                android:paddingBottom="84dp" />

            <LinearLayout
                android:id="@+id/emptyStateView"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:gravity="center"
                android:orientation="vertical"
                android:padding="32dp"
                android:visibility="gone">

                <ImageView
                    android:layout_width="56dp"
                    android:layout_height="56dp"
                    android:background="@drawable/bg_rounded_pill"
                    android:backgroundTint="@color/tag_studies_bg"
                    android:contentDescription="@string/app_name"
                    android:padding="14dp"
                    android:src="@drawable/ic_book"
                    app:tint="@color/primary_blue" />

                <TextView
                    android:id="@+id/tvEmptyTitle"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="16dp"
                    android:gravity="center"
                    android:text="Nenhuma anotação por aqui"
                    android:textColor="@color/text_primary"
                    android:textSize="16sp"
                    android:textStyle="bold" />

                <TextView
                    android:id="@+id/tvEmptySubtitle"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="6dp"
                    android:gravity="center"
                    android:text="Toque no botão + para criar sua primeira anotação!"
                    android:textColor="@color/text_secondary"
                    android:textSize="13sp" />
            </LinearLayout>
        </FrameLayout>

        <!-- Barra Inferior Limpa (Somente Nomes das Categorias) -->
        <HorizontalScrollView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:background="@color/bg_surface"
            android:elevation="6dp"
            android:fillViewport="true"
            android:scrollbars="none">

            <LinearLayout
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:gravity="center_vertical"
                android:orientation="horizontal"
                android:paddingStart="8dp"
                android:paddingTop="8dp"
                android:paddingEnd="8dp"
                android:paddingBottom="10dp">

                <TextView
                    android:id="@+id/tabAll"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginEnd="6dp"
                    android:background="@drawable/bg_rounded_pill"
                    android:clickable="true"
                    android:focusable="true"
                    android:gravity="center"
                    android:paddingStart="12dp"
                    android:paddingTop="8dp"
                    android:paddingEnd="12dp"
                    android:paddingBottom="8dp"
                    android:text="Início"
                    android:textSize="12sp" />

                <TextView
                    android:id="@+id/tabStudies"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginEnd="6dp"
                    android:background="@drawable/bg_rounded_pill"
                    android:clickable="true"
                    android:focusable="true"
                    android:gravity="center"
                    android:paddingStart="12dp"
                    android:paddingTop="8dp"
                    android:paddingEnd="12dp"
                    android:paddingBottom="8dp"
                    android:text="Estudos"
                    android:textSize="12sp" />

                <TextView
                    android:id="@+id/tabWork"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginEnd="6dp"
                    android:background="@drawable/bg_rounded_pill"
                    android:clickable="true"
                    android:focusable="true"
                    android:gravity="center"
                    android:paddingStart="12dp"
                    android:paddingTop="8dp"
                    android:paddingEnd="12dp"
                    android:paddingBottom="8dp"
                    android:text="Trabalho"
                    android:textSize="12sp" />

                <TextView
                    android:id="@+id/tabPersonal"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginEnd="6dp"
                    android:background="@drawable/bg_rounded_pill"
                    android:clickable="true"
                    android:focusable="true"
                    android:gravity="center"
                    android:paddingStart="12dp"
                    android:paddingTop="8dp"
                    android:paddingEnd="12dp"
                    android:paddingBottom="8dp"
                    android:text="Pessoal"
                    android:textSize="12sp" />

                <TextView
                    android:id="@+id/tabFavorites"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:background="@drawable/bg_rounded_pill"
                    android:clickable="true"
                    android:focusable="true"
                    android:gravity="center"
                    android:paddingStart="12dp"
                    android:paddingTop="8dp"
                    android:paddingEnd="12dp"
                    android:paddingBottom="8dp"
                    android:text="Favoritos"
                    android:textSize="12sp" />
            </LinearLayout>
        </HorizontalScrollView>
    </LinearLayout>

    <!-- Botão Flutuante (+ Nova Anotação) -->
    <com.google.android.material.floatingactionbutton.FloatingActionButton
        android:id="@+id/fabNewNote"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom|end"
        android:layout_marginEnd="18dp"
        android:layout_marginBottom="72dp"
        android:contentDescription="@string/cd_new_note"
        android:src="@drawable/ic_plus"
        app:backgroundTint="@color/primary_blue"
        app:tint="#FFFFFF" />

</androidx.coordinatorlayout.widget.CoordinatorLayout>
`
  },
  {
    name: 'activity_editor.xml',
    path: 'app/src/main/res/layout/activity_editor.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Layout do editor com Voltar, Salvar, Favoritar, Fixar, cartões de Categoria e barra de formatação',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_screen"
    android:orientation="vertical">

    <!-- Barra Superior do Editor -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@color/bg_surface"
        android:elevation="2dp"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        android:paddingStart="12dp"
        android:paddingTop="10dp"
        android:paddingEnd="12dp"
        android:paddingBottom="10dp">

        <Button
            android:id="@+id/btnBack"
            style="@style/Widget.MaterialComponents.Button.TextButton"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@string/btn_back"
            android:textAllCaps="false"
            android:textColor="@color/primary_blue"
            android:textStyle="bold" />

        <View
            android:layout_width="0dp"
            android:layout_height="0dp"
            android:layout_weight="1" />

        <ImageButton
            android:id="@+id/btnPinEditor"
            android:layout_width="40dp"
            android:layout_height="40dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:contentDescription="@string/cd_pin"
            android:padding="8dp"
            android:src="@drawable/ic_pin" />

        <ImageButton
            android:id="@+id/btnFavEditor"
            android:layout_width="40dp"
            android:layout_height="40dp"
            android:layout_marginEnd="6dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:contentDescription="@string/cd_favorite"
            android:padding="8dp"
            android:src="@drawable/ic_star_outline" />

        <Button
            android:id="@+id/btnSave"
            android:layout_width="wrap_content"
            android:layout_height="40dp"
            android:backgroundTint="@color/work_green"
            android:insetTop="0dp"
            android:insetBottom="0dp"
            android:minHeight="0dp"
            android:text="@string/btn_save"
            android:textAllCaps="false"
            android:textColor="#FFFFFF"
            android:textStyle="bold"
            app:cornerRadius="12dp" />
    </LinearLayout>

    <ScrollView
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:fillViewport="true">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="16dp">

            <!-- Seletor de Categoria em Cartões -->
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginBottom="8dp"
                android:text="CATEGORIA:"
                android:textColor="@color/text_secondary"
                android:textSize="11sp"
                android:textStyle="bold" />

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginBottom="16dp"
                android:orientation="horizontal">

                <LinearLayout
                    android:id="@+id/cardCatStudies"
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_marginEnd="6dp"
                    android:layout_weight="1"
                    android:background="@drawable/bg_rounded_pill"
                    android:clickable="true"
                    android:focusable="true"
                    android:gravity="center"
                    android:orientation="vertical"
                    android:paddingTop="10dp"
                    android:paddingBottom="10dp">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="@string/category_studies"
                        android:textColor="@color/tag_studies_text"
                        android:textSize="13sp"
                        android:textStyle="bold" />
                </LinearLayout>

                <LinearLayout
                    android:id="@+id/cardCatWork"
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_marginEnd="6dp"
                    android:layout_weight="1"
                    android:background="@drawable/bg_rounded_pill"
                    android:clickable="true"
                    android:focusable="true"
                    android:gravity="center"
                    android:orientation="vertical"
                    android:paddingTop="10dp"
                    android:paddingBottom="10dp">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="@string/category_work"
                        android:textColor="@color/tag_work_text"
                        android:textSize="13sp"
                        android:textStyle="bold" />
                </LinearLayout>

                <LinearLayout
                    android:id="@+id/cardCatPersonal"
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:background="@drawable/bg_rounded_pill"
                    android:clickable="true"
                    android:focusable="true"
                    android:gravity="center"
                    android:orientation="vertical"
                    android:paddingTop="10dp"
                    android:paddingBottom="10dp">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="@string/category_personal"
                        android:textColor="@color/tag_personal_text"
                        android:textSize="13sp"
                        android:textStyle="bold" />
                </LinearLayout>
            </LinearLayout>

            <!-- Cartão do Editor -->
            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="0dp"
                android:layout_weight="1"
                android:background="@drawable/bg_card_surface"
                android:orientation="vertical"
                android:padding="16dp">

                <EditText
                    android:id="@+id/etTitle"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:background="@null"
                    android:hint="@string/hint_title"
                    android:inputType="textCapSentences"
                    android:paddingBottom="10dp"
                    android:textColor="@color/text_primary"
                    android:textColorHint="@color/text_secondary"
                    android:textSize="20sp"
                    android:textStyle="bold" />

                <View
                    android:layout_width="match_parent"
                    android:layout_height="1dp"
                    android:layout_marginBottom="10dp"
                    android:background="@color/border_card" />

                <!-- Barra de Formatação Rápida -->
                <HorizontalScrollView
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:layout_marginBottom="10dp"
                    android:scrollbars="none">

                    <LinearLayout
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:orientation="horizontal">

                        <Button
                            android:id="@+id/btnFmtHeading"
                            style="@style/Widget.MaterialComponents.Button.OutlinedButton"
                            android:layout_width="wrap_content"
                            android:layout_height="34dp"
                            android:layout_marginEnd="6dp"
                            android:insetTop="0dp"
                            android:insetBottom="0dp"
                            android:minWidth="0dp"
                            android:minHeight="0dp"
                            android:paddingStart="10dp"
                            android:paddingEnd="10dp"
                            android:text="Título #"
                            android:textAllCaps="false"
                            android:textColor="@color/text_secondary"
                            android:textSize="11sp" />

                        <Button
                            android:id="@+id/btnFmtBold"
                            style="@style/Widget.MaterialComponents.Button.OutlinedButton"
                            android:layout_width="wrap_content"
                            android:layout_height="34dp"
                            android:layout_marginEnd="6dp"
                            android:insetTop="0dp"
                            android:insetBottom="0dp"
                            android:minWidth="0dp"
                            android:minHeight="0dp"
                            android:paddingStart="10dp"
                            android:paddingEnd="10dp"
                            android:text="Negrito"
                            android:textAllCaps="false"
                            android:textColor="@color/text_secondary"
                            android:textSize="11sp" />

                        <Button
                            android:id="@+id/btnFmtBullet"
                            style="@style/Widget.MaterialComponents.Button.OutlinedButton"
                            android:layout_width="wrap_content"
                            android:layout_height="34dp"
                            android:layout_marginEnd="6dp"
                            android:insetTop="0dp"
                            android:insetBottom="0dp"
                            android:minWidth="0dp"
                            android:minHeight="0dp"
                            android:paddingStart="10dp"
                            android:paddingEnd="10dp"
                            android:text="• Lista"
                            android:textAllCaps="false"
                            android:textColor="@color/text_secondary"
                            android:textSize="11sp" />

                        <Button
                            android:id="@+id/btnFmtCheck"
                            style="@style/Widget.MaterialComponents.Button.OutlinedButton"
                            android:layout_width="wrap_content"
                            android:layout_height="34dp"
                            android:insetTop="0dp"
                            android:insetBottom="0dp"
                            android:minWidth="0dp"
                            android:minHeight="0dp"
                            android:paddingStart="10dp"
                            android:paddingEnd="10dp"
                            android:text="[ ] Tarefa"
                            android:textAllCaps="false"
                            android:textColor="@color/text_secondary"
                            android:textSize="11sp" />
                    </LinearLayout>
                </HorizontalScrollView>

                <EditText
                    android:id="@+id/etContent"
                    android:layout_width="match_parent"
                    android:layout_height="0dp"
                    android:layout_weight="1"
                    android:background="@null"
                    android:gravity="top|start"
                    android:hint="@string/hint_content"
                    android:inputType="textMultiLine|textCapSentences"
                    android:lineSpacingExtra="4dp"
                    android:minHeight="240dp"
                    android:textColor="@color/text_primary"
                    android:textColorHint="@color/text_secondary"
                    android:textSize="15.5sp" />

                <View
                    android:layout_width="match_parent"
                    android:layout_height="1dp"
                    android:layout_marginTop="12dp"
                    android:layout_marginBottom="8dp"
                    android:background="@color/border_card" />

                <TextView
                    android:id="@+id/tvWordCounter"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="0 palavras • 0 caracteres"
                    android:textColor="@color/text_secondary"
                    android:textSize="11sp" />
            </LinearLayout>
        </LinearLayout>
    </ScrollView>

</LinearLayout>
`
  },
  {
    name: 'activity_viewer.xml',
    path: 'app/src/main/res/layout/activity_viewer.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Layout de leitura detalhada da anotação com ações rápidas no topo',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_screen"
    android:orientation="vertical">

    <!-- Barra de Ações Superior -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@color/bg_surface"
        android:elevation="2dp"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        android:paddingStart="8dp"
        android:paddingTop="10dp"
        android:paddingEnd="12dp"
        android:paddingBottom="10dp">

        <Button
            android:id="@+id/btnBack"
            style="@style/Widget.MaterialComponents.Button.TextButton"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@string/btn_back"
            android:textAllCaps="false"
            android:textColor="@color/primary_blue"
            android:textStyle="bold" />

        <View
            android:layout_width="0dp"
            android:layout_height="0dp"
            android:layout_weight="1" />

        <ImageButton
            android:id="@+id/btnPin"
            android:layout_width="38dp"
            android:layout_height="38dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:contentDescription="@string/cd_pin"
            android:padding="8dp"
            android:src="@drawable/ic_pin" />

        <ImageButton
            android:id="@+id/btnFavorite"
            android:layout_width="38dp"
            android:layout_height="38dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:contentDescription="@string/cd_favorite"
            android:padding="8dp"
            android:src="@drawable/ic_star_outline" />

        <ImageButton
            android:id="@+id/btnCopy"
            android:layout_width="38dp"
            android:layout_height="38dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:contentDescription="@string/cd_copy"
            android:padding="8dp"
            android:src="@drawable/ic_copy"
            app:tint="@color/icon_muted" />

        <ImageButton
            android:id="@+id/btnShare"
            android:layout_width="38dp"
            android:layout_height="38dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:contentDescription="@string/cd_share"
            android:padding="8dp"
            android:src="@drawable/ic_share"
            app:tint="@color/icon_muted" />

        <ImageButton
            android:id="@+id/btnDelete"
            android:layout_width="38dp"
            android:layout_height="38dp"
            android:layout_marginEnd="6dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:contentDescription="@string/cd_delete"
            android:padding="8dp"
            android:src="@drawable/ic_delete"
            app:tint="@color/danger_red" />

        <Button
            android:id="@+id/btnEdit"
            android:layout_width="wrap_content"
            android:layout_height="38dp"
            android:backgroundTint="@color/primary_blue"
            android:insetTop="0dp"
            android:insetBottom="0dp"
            android:minHeight="0dp"
            android:text="@string/btn_edit"
            android:textAllCaps="false"
            android:textColor="#FFFFFF"
            android:textStyle="bold"
            app:cornerRadius="12dp" />
    </LinearLayout>

    <!-- Conteúdo da Nota -->
    <ScrollView
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:padding="16dp">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:background="@drawable/bg_card_surface"
            android:orientation="vertical"
            android:padding="20dp">

            <!-- Badges e Estatísticas -->
            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:gravity="center_vertical"
                android:orientation="horizontal">

                <TextView
                    android:id="@+id/tvCategory"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:background="@drawable/bg_rounded_pill"
                    android:paddingStart="10dp"
                    android:paddingTop="4dp"
                    android:paddingEnd="10dp"
                    android:paddingBottom="4dp"
                    android:text="Estudos"
                    android:textSize="11sp"
                    android:textStyle="bold" />

                <TextView
                    android:id="@+id/tvPinnedBadge"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="8dp"
                    android:background="@drawable/bg_rounded_pill"
                    android:backgroundTint="@color/tag_studies_bg"
                    android:paddingStart="8dp"
                    android:paddingTop="3dp"
                    android:paddingEnd="8dp"
                    android:paddingBottom="3dp"
                    android:text="Fixada"
                    android:textColor="@color/primary_blue"
                    android:textSize="10sp"
                    android:textStyle="bold"
                    android:visibility="gone" />
            </LinearLayout>

            <TextView
                android:id="@+id/tvReadStats"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="8dp"
                android:text="~1 min leitura • 0 palavras"
                android:textColor="@color/text_secondary"
                android:textSize="11sp" />

            <!-- Título -->
            <TextView
                android:id="@+id/tvTitle"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="14dp"
                android:text="Título da Anotação"
                android:textColor="@color/text_primary"
                android:textSize="22sp"
                android:textStyle="bold" />

            <!-- Data de modificação -->
            <TextView
                android:id="@+id/tvDate"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="6dp"
                android:layout_marginBottom="16dp"
                android:text="Última modificação: 16/10/2026"
                android:textColor="@color/text_secondary"
                android:textSize="12sp" />

            <View
                android:layout_width="match_parent"
                android:layout_height="1dp"
                android:layout_marginBottom="16dp"
                android:background="@color/border_card" />

            <!-- Texto completo -->
            <TextView
                android:id="@+id/tvContent"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:lineSpacingExtra="5dp"
                android:textColor="@color/text_primary"
                android:textIsSelectable="true"
                android:textSize="16sp" />

            <View
                android:layout_width="match_parent"
                android:layout_height="1dp"
                android:layout_marginTop="24dp"
                android:layout_marginBottom="10dp"
                android:background="@color/border_card" />

            <TextView
                android:id="@+id/tvCreatedDate"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Criada em: 16/10/2026"
                android:textColor="@color/text_secondary"
                android:textSize="11sp" />
        </LinearLayout>
    </ScrollView>

</LinearLayout>
`
  },
  {
    name: 'item_note.xml',
    path: 'app/src/main/res/layout/item_note.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Cartão moderno da anotação com cantos arredondados, tag colorida e botões de ação',
    content: `<?xml version="1.0" encoding="utf-8"?>
<com.google.android.material.card.MaterialCardView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginBottom="10dp"
    app:cardBackgroundColor="@color/bg_surface"
    app:cardCornerRadius="18dp"
    app:cardElevation="1dp"
    app:strokeColor="@color/border_card"
    app:strokeWidth="1dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <!-- Linha Superior: Tag Categoria + Badge Fixada + Botões Fixar/Favoritar -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:gravity="center_vertical"
            android:orientation="horizontal">

            <TextView
                android:id="@+id/tvCategory"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:background="@drawable/bg_rounded_pill"
                android:paddingStart="10dp"
                android:paddingTop="3dp"
                android:paddingEnd="10dp"
                android:paddingBottom="3dp"
                android:text="Estudos"
                android:textSize="11sp"
                android:textStyle="bold" />

            <TextView
                android:id="@+id/tvPinnedBadge"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginStart="6dp"
                android:background="@drawable/bg_rounded_pill"
                android:backgroundTint="@color/tag_studies_bg"
                android:paddingStart="8dp"
                android:paddingTop="2dp"
                android:paddingEnd="8dp"
                android:paddingBottom="2dp"
                android:text="Fixada"
                android:textColor="@color/primary_blue"
                android:textSize="10sp"
                android:textStyle="bold"
                android:visibility="gone" />

            <View
                android:layout_width="0dp"
                android:layout_height="0dp"
                android:layout_weight="1" />

            <ImageButton
                android:id="@+id/btnPin"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:contentDescription="@string/cd_pin"
                android:padding="6dp"
                android:src="@drawable/ic_pin" />

            <ImageButton
                android:id="@+id/btnFavorite"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:contentDescription="@string/cd_favorite"
                android:padding="6dp"
                android:src="@drawable/ic_star_outline" />
        </LinearLayout>

        <!-- Título -->
        <TextView
            android:id="@+id/tvTitle"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="10dp"
            android:ellipsize="end"
            android:maxLines="2"
            android:text="Título da Anotação"
            android:textColor="@color/text_primary"
            android:textSize="16sp"
            android:textStyle="bold" />

        <!-- Prévia do Conteúdo -->
        <TextView
            android:id="@+id/tvContentPreview"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="4dp"
            android:ellipsize="end"
            android:lineSpacingExtra="2dp"
            android:maxLines="3"
            android:text="Prévia do conteúdo da anotação..."
            android:textColor="@color/text_secondary"
            android:textSize="13.5sp" />

        <View
            android:layout_width="match_parent"
            android:layout_height="1dp"
            android:layout_marginTop="12dp"
            android:background="@color/border_card" />

        <!-- Rodapé: Data e Botões (Visualizar, Editar, Excluir) -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:gravity="center_vertical"
            android:orientation="horizontal">

            <TextView
                android:id="@+id/tvDate"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="16/10/2026 10:30"
                android:textColor="@color/text_secondary"
                android:textSize="11.5sp" />

            <ImageButton
                android:id="@+id/btnView"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:contentDescription="@string/cd_view"
                android:padding="6dp"
                android:src="@drawable/ic_eye"
                app:tint="@color/primary_blue" />

            <ImageButton
                android:id="@+id/btnEdit"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:contentDescription="@string/cd_edit"
                android:padding="6dp"
                android:src="@drawable/ic_edit"
                app:tint="@color/work_green" />

            <ImageButton
                android:id="@+id/btnDelete"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:contentDescription="@string/cd_delete"
                android:padding="6dp"
                android:src="@drawable/ic_delete"
                app:tint="@color/danger_red" />
        </LinearLayout>

    </LinearLayout>
</com.google.android.material.card.MaterialCardView>
`
  },

  // ===========================================================================
  // CORES, STRINGS, TEMAS (LIGHT + NIGHT) & REGRAS DE BACKUP
  // ===========================================================================
  {
    name: 'colors.xml (Tema Claro)',
    path: 'app/src/main/res/values/colors.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Paleta harmônica (Azul, Verde, Lilás e Branco) para o Modo Claro',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary_blue">#2563EB</color>
    <color name="study_blue_dark">#1D4ED8</color>
    <color name="work_green">#059669</color>
    <color name="personal_purple">#7C3AED</color>
    <color name="favorite_yellow">#F59E0B</color>
    <color name="danger_red">#E11D48</color>

    <color name="bg_screen">#F8FAFC</color>
    <color name="bg_surface">#FFFFFF</color>
    <color name="bg_search">#F1F5F9</color>
    <color name="border_card">#E2E8F0</color>
    <color name="text_primary">#0F172A</color>
    <color name="text_secondary">#64748B</color>
    <color name="icon_muted">#64748B</color>

    <color name="tag_studies_bg">#DBEAFE</color>
    <color name="tag_studies_text">#1D4ED8</color>
    <color name="tag_work_bg">#D1FAE5</color>
    <color name="tag_work_text">#047857</color>
    <color name="tag_personal_bg">#EDE9FE</color>
    <color name="tag_personal_text">#6D28D9</color>

    <color name="tab_all_active">#0F172A</color>
    <color name="tab_active_text">#FFFFFF</color>
    <color name="tab_inactive_bg">#F1F5F9</color>
</resources>
`
  },
  {
    name: 'colors.xml (Modo Escuro)',
    path: 'app/src/main/res/values-night/colors.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Paleta escura de alto contraste para o Modo Escuro automático no Android',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary_blue">#3B82F6</color>
    <color name="study_blue_dark">#2563EB</color>
    <color name="work_green">#10B981</color>
    <color name="personal_purple">#A78BFA</color>
    <color name="favorite_yellow">#FBBF24</color>
    <color name="danger_red">#FB7185</color>

    <color name="bg_screen">#020617</color>
    <color name="bg_surface">#0F172A</color>
    <color name="bg_search">#1E293B</color>
    <color name="border_card">#1E293B</color>
    <color name="text_primary">#F8FAFC</color>
    <color name="text_secondary">#94A3B8</color>
    <color name="icon_muted">#94A3B8</color>

    <color name="tag_studies_bg">#1E3A8A</color>
    <color name="tag_studies_text">#93C5FD</color>
    <color name="tag_work_bg">#064E3B</color>
    <color name="tag_work_text">#6EE7B7</color>
    <color name="tag_personal_bg">#4C1D95</color>
    <color name="tag_personal_text">#DDD6FE</color>

    <color name="tab_all_active">#F8FAFC</color>
    <color name="tab_active_text">#0F172A</color>
    <color name="tab_inactive_bg">#1E293B</color>
</resources>
`
  },
  {
    name: 'strings.xml',
    path: 'app/src/main/res/values/strings.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Textos e rótulos de acessibilidade em português',
    content: `<resources>
    <string name="app_name">Bloco de Notas</string>
    <string name="app_subtitle">Java • Acessível</string>
    <string name="title_editor">Editar Anotação</string>
    <string name="title_viewer">Visualizar Anotação</string>

    <string name="category_studies">Estudos</string>
    <string name="category_work">Trabalho</string>
    <string name="category_personal">Pessoal</string>

    <string name="hint_search">Pesquisar por título ou conteúdo...</string>
    <string name="hint_title">Título da anotação...</string>
    <string name="hint_content">Escreva sua anotação aqui...</string>

    <string name="btn_back">← Voltar</string>
    <string name="btn_save">Salvar</string>
    <string name="btn_edit">Editar</string>

    <string name="cd_search">Pesquisar</string>
    <string name="cd_clear_search">Limpar pesquisa</string>
    <string name="cd_text_size">Alterar tamanho do texto</string>
    <string name="cd_toggle_theme">Alternar modo escuro</string>
    <string name="cd_exit">Sair do aplicativo</string>
    <string name="cd_new_note">Criar nova anotação</string>
    <string name="cd_pin">Fixar no topo</string>
    <string name="cd_favorite">Favoritar anotação</string>
    <string name="cd_view">Visualizar anotação</string>
    <string name="cd_edit">Editar anotação</string>
    <string name="cd_delete">Excluir anotação</string>
    <string name="cd_copy">Copiar anotação</string>
    <string name="cd_share">Compartilhar anotação</string>
</resources>
`
  },
  {
    name: 'themes.xml (Claro)',
    path: 'app/src/main/res/values/themes.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Tema próprio Theme.BlocoDeNotas (sem herança cíclica) para Modo Claro',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.BlocoDeNotas" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary_blue</item>
        <item name="colorPrimaryVariant">@color/study_blue_dark</item>
        <item name="colorOnPrimary">#FFFFFF</item>
        <item name="colorSecondary">@color/work_green</item>
        <item name="colorOnSecondary">#FFFFFF</item>
        <item name="android:statusBarColor">@color/bg_surface</item>
        <item name="android:windowLightStatusBar">true</item>
    </style>
</resources>
`
  },
  {
    name: 'themes.xml (Escuro)',
    path: 'app/src/main/res/values-night/themes.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Tema próprio Theme.BlocoDeNotas para Modo Escuro',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.BlocoDeNotas" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary_blue</item>
        <item name="colorPrimaryVariant">@color/study_blue_dark</item>
        <item name="colorOnPrimary">#FFFFFF</item>
        <item name="colorSecondary">@color/work_green</item>
        <item name="colorOnSecondary">#FFFFFF</item>
        <item name="android:statusBarColor">@color/bg_surface</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>
`
  },
  {
    name: 'backup_rules.xml',
    path: 'app/src/main/res/xml/backup_rules.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Regras de backup automático para Android 11 e anteriores',
    content: `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content />
`
  },
  {
    name: 'data_extraction_rules.xml',
    path: 'app/src/main/res/xml/data_extraction_rules.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Regras de transferência de dados para Android 12+',
    content: `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup />
</data-extraction-rules>
`
  },

  // ===========================================================================
  // ÍCONES ADAPTATIVOS (LAUNCHER) E SHAPES XML + VECTOR DRAWABLES
  // ===========================================================================
  {
    name: 'ic_launcher.xml',
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone adaptativo oficial do aplicativo para Android 8+',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
  },
  {
    name: 'ic_launcher_round.xml',
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone adaptativo redondo para Android 8+',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
  },
  {
    name: 'ic_launcher_background.xml',
    path: 'app/src/main/res/drawable/ic_launcher_background.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Fundo gradiente azul/lilás/verde do ícone do aplicativo',
    content: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <gradient
        android:angle="135"
        android:endColor="#059669"
        android:centerColor="#7C3AED"
        android:startColor="#2563EB"
        android:type="linear" />
</shape>
`
  },
  {
    name: 'ic_launcher_foreground.xml',
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Vetor do bloco de notas para o ícone do aplicativo',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M34,26C31.8,26 30,27.8 30,30V78C30,80.2 31.8,82 34,82H74C76.2,82 78,80.2 78,78V30C78,27.8 76.2,26 74,26H34ZM40,40H68V45H40V40ZM40,51H68V56H40V51ZM40,62H58V67H40V62Z" />
</vector>
`
  },
  {
    name: 'bg_rounded_pill.xml',
    path: 'app/src/main/res/drawable/bg_rounded_pill.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Forma de pílula arredondada para tags e abas',
    content: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <corners android:radius="50dp" />
    <solid android:color="@color/tab_inactive_bg" />
</shape>
`
  },
  {
    name: 'bg_search_box.xml',
    path: 'app/src/main/res/drawable/bg_search_box.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Fundo arredondado da barra de pesquisa',
    content: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <corners android:radius="14dp" />
    <solid android:color="@color/bg_search" />
    <stroke
        android:width="1dp"
        android:color="@color/border_card" />
</shape>
`
  },
  {
    name: 'bg_card_surface.xml',
    path: 'app/src/main/res/drawable/bg_card_surface.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Fundo de cartão moderno com bordas suaves',
    content: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <corners android:radius="20dp" />
    <solid android:color="@color/bg_surface" />
    <stroke
        android:width="1dp"
        android:color="@color/border_card" />
</shape>
`
  },
  {
    name: 'bg_logo_gradient.xml',
    path: 'app/src/main/res/drawable/bg_logo_gradient.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Gradiente azul/lilás do ícone no cabeçalho',
    content: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <corners android:radius="11dp" />
    <gradient
        android:angle="45"
        android:endColor="#7C3AED"
        android:startColor="#2563EB"
        android:type="linear" />
</shape>
`
  },

  // Vector Icons (24dp crisp vector drawables)
  {
    name: 'ic_book.xml',
    path: 'app/src/main/res/drawable/ic_book.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial do livro/caderno',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M18,2H6C4.9,2 4,2.9 4,4V20C4,21.1 4.9,22 6,22H18C19.1,22 20,21.1 20,20V4C20,2.9 19.1,2 18,2ZM6,4H11V12L8.5,10.5L6,12V4Z" />
</vector>
`
  },
  {
    name: 'ic_search.xml',
    path: 'app/src/main/res/drawable/ic_search.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de pesquisa',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#64748B"
        android:pathData="M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5C16,5.91 13.09,3 9.5,3C5.91,3 3,5.91 3,9.5C3,13.09 5.91,16 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.49L20.49,19L15.5,14ZM9.5,14C7.01,14 5,11.99 5,9.5C5,7.01 7.01,5 9.5,5C11.99,5 14,7.01 14,9.5C14,11.99 11.99,14 9.5,14Z" />
</vector>
`
  },
  {
    name: 'ic_close.xml',
    path: 'app/src/main/res/drawable/ic_close.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de limpar/fechar',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#64748B"
        android:pathData="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
</vector>
`
  },
  {
    name: 'ic_plus.xml',
    path: 'app/src/main/res/drawable/ic_plus.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de adicionar nota',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
</vector>
`
  },
  {
    name: 'ic_text_size.xml',
    path: 'app/src/main/res/drawable/ic_text_size.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de tamanho de fonte (acessibilidade)',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#7C3AED"
        android:pathData="M9,4V7H14V19H17V7H22V4H9ZM3,12H6V19H9V12H12V9H3V12Z" />
</vector>
`
  },
  {
    name: 'ic_moon.xml',
    path: 'app/src/main/res/drawable/ic_moon.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de modo escuro',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#6366F1"
        android:pathData="M12,3C7.03,3 3,7.03 3,12C3,16.97 7.03,21 12,21C15.53,21 18.59,18.96 20.07,15.98C19.38,16.19 18.65,16.3 17.9,16.3C13.7,16.3 10.3,12.9 10.3,8.7C10.3,6.54 11.2,4.59 12.65,3.21C12.44,3.07 12.22,3 12,3Z" />
</vector>
`
  },
  {
    name: 'ic_sun.xml',
    path: 'app/src/main/res/drawable/ic_sun.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de modo claro',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FBBF24"
        android:pathData="M12,7C9.24,7 7,9.24 7,12C7,14.76 9.24,17 12,17C14.76,17 17,14.76 17,12C17,9.24 14.76,7 12,7ZM12,2L14.39,5.42C13.62,5.15 12.82,5 12,5C11.18,5 10.38,5.15 9.61,5.42L12,2ZM12,22L9.61,18.58C10.38,18.85 11.18,19 12,19C12.82,19 13.62,18.85 14.39,18.58L12,22ZM2,12L5.42,9.61C5.15,10.38 5,11.18 5,12C5,12.82 5.15,13.62 5.42,14.39L2,12ZM22,12L18.58,14.39C18.85,13.62 19,12.82 19,12C19,11.18 18.85,10.38 18.58,9.61L22,12Z" />
</vector>
`
  },
  {
    name: 'ic_exit.xml',
    path: 'app/src/main/res/drawable/ic_exit.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de sair do app',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#E11D48"
        android:pathData="M17,7L15.59,8.41L18.17,11H8V13H18.17L15.59,15.58L17,17L22,12L17,7ZM4,5H12V3H4C2.9,3 2,3.9 2,5V19C2,20.1 2.9,21 4,21H12V19H4V5Z" />
</vector>
`
  },
  {
    name: 'ic_star_filled.xml',
    path: 'app/src/main/res/drawable/ic_star_filled.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de favorito ativo',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#F59E0B"
        android:pathData="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.46,13.97L5.82,21L12,17.27Z" />
</vector>
`
  },
  {
    name: 'ic_star_outline.xml',
    path: 'app/src/main/res/drawable/ic_star_outline.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de favorito inativo',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#64748B"
        android:pathData="M22,9.24L14.81,8.62L12,2L9.19,8.63L2,9.24L7.46,13.97L5.82,21L12,17.27L18.18,21L16.55,13.97L22,9.24ZM12,15.4L8.24,17.67L9.24,13.39L5.92,10.51L10.3,10.13L12,6.1L13.71,10.14L18.09,10.52L14.77,13.4L15.77,17.68L12,15.4Z" />
</vector>
`
  },
  {
    name: 'ic_pin.xml',
    path: 'app/src/main/res/drawable/ic_pin.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de fixar no topo',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#64748B"
        android:pathData="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
</vector>
`
  },
  {
    name: 'ic_eye.xml',
    path: 'app/src/main/res/drawable/ic_eye.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de visualizar',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#2563EB"
        android:pathData="M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5ZM12,17C9.24,17 7,14.76 7,12C7,9.24 9.24,7 12,7C14.76,7 17,9.24 17,12C17,14.76 14.76,17 12,17ZM12,9C10.34,9 9,10.34 9,12C9,13.66 10.34,15 12,15C13.66,15 15,13.66 15,12C15,10.34 13.66,9 12,9Z" />
</vector>
`
  },
  {
    name: 'ic_edit.xml',
    path: 'app/src/main/res/drawable/ic_edit.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de editar',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#059669"
        android:pathData="M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25ZM20.71,7.04C21.1,6.65 21.1,6.02 20.71,5.63L18.37,3.29C17.98,2.9 17.35,2.9 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04Z" />
</vector>
`
  },
  {
    name: 'ic_delete.xml',
    path: 'app/src/main/res/drawable/ic_delete.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de excluir',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#E11D48"
        android:pathData="M6,19C6,20.1 6.9,21 8,21H16C17.1,21 18,20.1 18,19V7H6V19ZM19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4Z" />
</vector>
`
  },
  {
    name: 'ic_copy.xml',
    path: 'app/src/main/res/drawable/ic_copy.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de copiar',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#64748B"
        android:pathData="M16,1H4C2.9,1 2,1.9 2,3V17H4V3H16V1ZM19,5H8C6.9,5 6,5.9 6,7V21C6,22.1 6.9,23 8,23H19C20.1,23 21,22.1 21,21V7C21,5.9 20.1,5 19,5ZM19,21H8V7H19V21Z" />
</vector>
`
  },
  {
    name: 'ic_share.xml',
    path: 'app/src/main/res/drawable/ic_share.xml',
    language: 'xml',
    category: 'android_res',
    description: 'Ícone vetorial de compartilhar',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#64748B"
        android:pathData="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8C19.66,8 21,6.66 21,5C21,3.34 19.66,2 18,2C16.34,2 15,3.34 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9C4.34,9 3,10.34 3,12C3,13.66 4.34,15 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.35C15.11,18.56 15.08,18.78 15.08,19C15.08,20.61 16.39,21.92 18,21.92C19.61,21.92 20.92,20.61 20.92,19C20.92,17.39 19.61,16.08 18,16.08Z" />
</vector>
`
  },
];

async function run() {
  // 1. Gerar PNGs de mipmap e salvar em android-studio-project
  const binaryAssets = await generateMipmapIcons();

  // 2. Gravar arquivos de texto em android-studio-project
  for (const file of androidFiles) {
    const targetPath = path.join(BASE_DIR, file.path);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, file.content, 'utf8');
  }

  // 3. Gerar src/data/javaCodeFiles.ts
  const tsJavaFiles = `export interface JavaProjectFile {
  name: string;
  path: string;
  language: 'java' | 'xml' | 'groovy';
  category: 'android_config' | 'android_java' | 'android_res';
  description: string;
  content: string;
}

export const JAVA_PROJECT_FILES: JavaProjectFile[] = ${JSON.stringify(androidFiles, null, 2)};
`;
  fs.writeFileSync('src/data/javaCodeFiles.ts', tsJavaFiles, 'utf8');

  // 4. Gerar src/data/androidBinaryAssets.ts (PNGs dos ícones mipmap)
  const tsBinaryAssets = `export interface AndroidBinaryAsset {
  path: string;
  base64: string;
}

export const ANDROID_BINARY_ASSETS: AndroidBinaryAsset[] = ${JSON.stringify(binaryAssets, null, 2)};
`;
  fs.writeFileSync('src/data/androidBinaryAssets.ts', tsBinaryAssets, 'utf8');

  console.log(
    `Generated Android Studio project with ${androidFiles.length} source/XML/Gradle files and ${binaryAssets.length} mipmap PNG icons.`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
