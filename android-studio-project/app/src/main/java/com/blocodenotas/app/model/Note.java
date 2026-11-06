package com.blocodenotas.app.model;

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
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
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

    // Getters e Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { 
        this.title = title; 
        this.updatedAt = System.currentTimeMillis();
    }

    public String getContent() { return content; }
    public void setContent(String content) { 
        this.content = content; 
        this.updatedAt = System.currentTimeMillis();
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }

    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean pinned) { isPinned = pinned; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }

    public String getFormattedDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
        return sdf.format(new Date(this.updatedAt));
    }
}
