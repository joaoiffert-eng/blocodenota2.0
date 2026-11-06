package com.blocodenotas.app.adapter;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.blocodenotas.app.R;
import com.blocodenotas.app.model.Note;

import java.util.ArrayList;
import java.util.List;

public class NoteAdapter extends RecyclerView.Adapter<NoteAdapter.NoteViewHolder> {

    public interface OnNoteClickListener {
        void onNoteClick(Note note);
        void onNoteEdit(Note note);
        void onNoteDelete(Note note);
        void onNoteFavoriteToggle(Note note);
    }

    private final Context context;
    private final OnNoteClickListener listener;
    private List<Note> notes = new ArrayList<>();

    public NoteAdapter(Context context, OnNoteClickListener listener) {
        this.context = context;
        this.listener = listener;
    }

    public void setNotes(List<Note> notes) {
        this.notes = notes;
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
        holder.bind(note, listener);
    }

    @Override
    public int getItemCount() {
        return notes.size();
    }

    static class NoteViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvTitle, tvContentPreview, tvCategory, tvDate;
        private final ImageButton btnFavorite, btnEdit, btnDelete;

        public NoteViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvContentPreview = itemView.findViewById(R.id.tvContentPreview);
            tvCategory = itemView.findViewById(R.id.tvCategory);
            tvDate = itemView.findViewById(R.id.tvDate);
            btnFavorite = itemView.findViewById(R.id.btnFavorite);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }

        public void bind(Note note, OnNoteClickListener listener) {
            tvTitle.setText(note.getTitle());
            tvContentPreview.setText(note.getContent());
            tvDate.setText(note.getFormattedDate());

            // Cores suaves por categoria (Azul, Verde, Lilás)
            switch (note.getCategory().toLowerCase()) {
                case "trabalho":
                    tvCategory.setText("TRABALHO");
                    tvCategory.setBackgroundColor(Color.parseColor("#D1FAE5")); // Verde suave
                    tvCategory.setTextColor(Color.parseColor("#065F46"));
                    break;
                case "pessoal":
                    tvCategory.setText("PESSOAL");
                    tvCategory.setBackgroundColor(Color.parseColor("#EDE9FE")); // Lilás suave
                    tvCategory.setTextColor(Color.parseColor("#5B21B6"));
                    break;
                default:
                    tvCategory.setText("ESTUDOS");
                    tvCategory.setBackgroundColor(Color.parseColor("#DBEAFE")); // Azul suave
                    tvCategory.setTextColor(Color.parseColor("#1E40AF"));
                    break;
            }

            // Ícone Favorito
            if (note.isFavorite()) {
                btnFavorite.setImageResource(android.R.drawable.star_big_on);
            } else {
                btnFavorite.setImageResource(android.R.drawable.star_big_off);
            }

            // Cliques
            itemView.setOnClickListener(v -> listener.onNoteClick(note));
            btnEdit.setOnClickListener(v -> listener.onNoteEdit(note));
            btnDelete.setOnClickListener(v -> listener.onNoteDelete(note));
            btnFavorite.setOnClickListener(v -> listener.onNoteFavoriteToggle(note));
        }
    }
}
