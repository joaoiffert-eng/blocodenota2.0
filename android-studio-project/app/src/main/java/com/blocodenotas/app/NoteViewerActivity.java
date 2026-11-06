package com.blocodenotas.app;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.blocodenotas.app.database.NoteDatabaseHelper;
import com.blocodenotas.app.model.Note;

public class NoteViewerActivity extends AppCompatActivity {

    private TextView tvTitle, tvContent, tvCategory, tvDate;
    private Button btnBack, btnEdit, btnDelete, btnCopy;
    private NoteDatabaseHelper dbHelper;
    private Note currentNote;
    private long noteId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_viewer);

        dbHelper = new NoteDatabaseHelper(this);
        noteId = getIntent().getLongExtra("note_id", -1);

        initViews();
        loadNote();
        setupListeners();
    }

    private void initViews() {
        tvTitle = findViewById(R.id.tvTitle);
        tvContent = findViewById(R.id.tvContent);
        tvCategory = findViewById(R.id.tvCategory);
        tvDate = findViewById(R.id.tvDate);
        btnBack = findViewById(R.id.btnBack);
        btnEdit = findViewById(R.id.btnEdit);
        btnDelete = findViewById(R.id.btnDelete);
        btnCopy = findViewById(R.id.btnCopy);
    }

    private void loadNote() {
        for (Note n : dbHelper.getNotes("todas", false, "")) {
            if (n.getId() == noteId) {
                currentNote = n;
                tvTitle.setText(n.getTitle());
                tvContent.setText(n.getContent());
                tvCategory.setText(n.getCategory().toUpperCase());
                tvDate.setText(n.getFormattedDate());
                break;
            }
        }
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        btnEdit.setOnClickListener(v -> {
            Intent intent = new Intent(this, NoteEditorActivity.class);
            intent.putExtra("note_id", noteId);
            startActivity(intent);
            finish();
        });

        btnDelete.setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                    .setTitle("Excluir Anotação")
                    .setMessage("Tem certeza de que deseja excluir permanentemente?")
                    .setPositiveButton("Excluir", (dialog, which) -> {
                        dbHelper.deleteNote(noteId);
                        Toast.makeText(this, "Anotação excluída.", Toast.LENGTH_SHORT).show();
                        finish();
                    })
                    .setNegativeButton("Cancelar", null)
                    .show();
        });

        btnCopy.setOnClickListener(v -> {
            ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData clip = ClipData.newPlainText("Nota", tvTitle.getText() + "\n\n" + tvContent.getText());
            clipboard.setPrimaryClip(clip);
            Toast.makeText(this, "Conteúdo copiado para a área de transferência!", Toast.LENGTH_SHORT).show();
        });
    }
}
