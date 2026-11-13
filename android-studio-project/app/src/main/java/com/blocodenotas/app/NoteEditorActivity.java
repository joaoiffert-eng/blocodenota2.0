package com.blocodenotas.app;

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
        int words = trimmed.isEmpty() ? 0 : trimmed.split("\\s+").length;
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
