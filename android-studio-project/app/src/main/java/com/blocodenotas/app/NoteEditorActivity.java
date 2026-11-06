package com.blocodenotas.app;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioGroup;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.blocodenotas.app.database.NoteDatabaseHelper;
import com.blocodenotas.app.model.Note;

public class NoteEditorActivity extends AppCompatActivity {

    private EditText etTitle, etContent;
    private RadioGroup rgCategory;
    private Button btnSave, btnBack;
    private NoteDatabaseHelper dbHelper;
    private Note currentNote;
    private boolean isEditing = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_editor);

        dbHelper = new NoteDatabaseHelper(this);
        initViews();

        long noteId = getIntent().getLongExtra("note_id", -1);
        if (noteId != -1) {
            isEditing = true;
            loadNoteData(noteId);
        }

        setupListeners();
    }

    private void initViews() {
        etTitle = findViewById(R.id.etTitle);
        etContent = findViewById(R.id.etContent);
        rgCategory = findViewById(R.id.rgCategory);
        btnSave = findViewById(R.id.btnSave);
        btnBack = findViewById(R.id.btnBack);
    }

    private void loadNoteData(long noteId) {
        for (Note n : dbHelper.getNotes("todas", false, "")) {
            if (n.getId() == noteId) {
                currentNote = n;
                etTitle.setText(n.getTitle());
                etContent.setText(n.getContent());
                switch (n.getCategory()) {
                    case "trabalho":
                        rgCategory.check(R.id.rbTrabalho);
                        break;
                    case "pessoal":
                        rgCategory.check(R.id.rbPessoal);
                        break;
                    default:
                        rgCategory.check(R.id.rbEstudos);
                        break;
                }
                break;
            }
        }
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> handleBackWithConfirmation());
        btnSave.setOnClickListener(v -> saveNote());
    }

    private void saveNote() {
        String title = etTitle.getText().toString().trim();
        String content = etContent.getText().toString().trim();

        if (title.isEmpty()) {
            etTitle.setError("Informe um título para salvar a anotação");
            etTitle.requestFocus();
            return;
        }

        String category = "estudos";
        int checkedId = rgCategory.getCheckedRadioButtonId();
        if (checkedId == R.id.rbTrabalho) {
            category = "trabalho";
        } else if (checkedId == R.id.rbPessoal) {
            category = "pessoal";
        }

        if (isEditing && currentNote != null) {
            currentNote.setTitle(title);
            currentNote.setContent(content);
            currentNote.setCategory(category);
            dbHelper.updateNote(currentNote);
            Toast.makeText(this, "Anotação atualizada com sucesso!", Toast.LENGTH_SHORT).show();
        } else {
            Note newNote = new Note(title, content, category);
            dbHelper.insertNote(newNote);
            Toast.makeText(this, "Anotação salva com sucesso!", Toast.LENGTH_SHORT).show();
        }

        finish();
    }

    private void handleBackWithConfirmation() {
        if (!etTitle.getText().toString().trim().isEmpty() || !etContent.getText().toString().trim().isEmpty()) {
            new AlertDialog.Builder(this)
                    .setTitle("Descartar alterações?")
                    .setMessage("Você tem alterações não salvas. Deseja realmente voltar?")
                    .setPositiveButton("Descartar", (dialog, which) -> finish())
                    .setNegativeButton("Continuar Editando", null)
                    .show();
        } else {
            finish();
        }
    }

    @Override
    public void onBackPressed() {
        handleBackWithConfirmation();
    }
}
