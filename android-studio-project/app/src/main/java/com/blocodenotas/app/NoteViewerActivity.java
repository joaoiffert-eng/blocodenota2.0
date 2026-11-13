package com.blocodenotas.app;

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
            ClipData clip = ClipData.newPlainText("Anotação", currentNote.getTitle() + "\n\n" + currentNote.getContent());
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
            shareIntent.putExtra(Intent.EXTRA_TEXT, currentNote.getTitle() + "\n\n" + currentNote.getContent());
            startActivity(Intent.createChooser(shareIntent, "Compartilhar anotação via"));
        });

        btnDelete.setOnClickListener(v -> {
            if (currentNote == null) return;
            new AlertDialog.Builder(this)
                    .setTitle("Excluir Anotação")
                    .setMessage("Tem certeza de que deseja excluir \"" + currentNote.getTitle() + "\" permanentemente?")
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
