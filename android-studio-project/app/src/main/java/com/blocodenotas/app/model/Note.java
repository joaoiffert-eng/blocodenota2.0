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
        return text.split("\\s+").length;
    }

    public int getReadTimeMinutes() {
        return Math.max(1, (int) Math.ceil(getWordCount() / 200.0));
    }
}
