package com.blocodenotas.app.adapter;

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
