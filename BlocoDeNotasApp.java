import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;
import javax.swing.*;
import javax.swing.border.*;

/**
 * ==============================================================================
 * BLOCO DE NOTAS MODERNO & ACESSÍVEL EM JAVA (FORMATO CELULAR)
 * ==============================================================================
 * 
 * Aplicativo completo desenvolvido em Java puro (Swing/AWT) com:
 *  - Formato e proporção de Celular / Smartphone (420 x 780 px)
 *  - Paleta de cores moderna: Azul (#2563EB), Verde (#059669), Lilás (#7C3AED) e Branco
 *  - Categorias: Estudos, Trabalho e Pessoal
 *  - Favoritos (marcar / desmarcar) e Fixar no topo
 *  - Pesquisa em tempo real por título ou conteúdo
 *  - Modo Escuro (Dark Mode) e Modo Claro
 *  - Diálogo de confirmação para Excluir e para Sair
 *  - Armazenamento persistente automático em arquivo local (100% offline)
 *
 * Como compilar e executar em qualquer computador com Java:
 *   1. javac BlocoDeNotasApp.java
 *   2. java BlocoDeNotasApp
 * ==============================================================================
 */
public class BlocoDeNotasApp extends JFrame {

    // Modelo de Anotação
    public static class Nota implements Serializable {
        private static final long serialVersionUID = 1L;
        private String id;
        private String titulo;
        private String conteudo;
        private String categoria; // "estudos", "trabalho", "pessoal"
        private boolean favorito;
        private boolean fixado;
        private long atualizadoEm;

        public Nota(String titulo, String conteudo, String categoria) {
            this.id = UUID.randomUUID().toString();
            this.titulo = titulo;
            this.conteudo = conteudo;
            this.categoria = categoria;
            this.favorito = false;
            this.fixado = false;
            this.atualizadoEm = System.currentTimeMillis();
        }

        public String getId() { return id; }
        public String getTitulo() { return titulo; }
        public void setTitulo(String t) { this.titulo = t; this.atualizadoEm = System.currentTimeMillis(); }
        public String getConteudo() { return conteudo; }
        public void setConteudo(String c) { this.conteudo = c; this.atualizadoEm = System.currentTimeMillis(); }
        public String getCategoria() { return categoria; }
        public void setCategoria(String cat) { this.categoria = cat; }
        public boolean isFavorito() { return favorito; }
        public void setFavorito(boolean f) { this.favorito = f; }
        public boolean isFixado() { return fixado; }
        public void setFixado(boolean fix) { this.fixado = fix; }
        public long getAtualizadoEm() { return atualizadoEm; }

        public String getDataFormatada() {
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
            return sdf.format(new Date(this.atualizadoEm));
        }
    }

    // Gerenciador de Persistência Local (Arquivo .txt simples)
    public static class BancoNotas {
        private static final String ARQUIVO = "bloco_de_notas_dados.txt";

        public static List<Nota> carregar() {
            List<Nota> lista = new ArrayList<>();
            File file = new File(ARQUIVO);
            if (!file.exists()) {
                // Notas de exemplo iniciais
                Nota n1 = new Nota("Resumo de Biologia: Estrutura Celular",
                        "Principais tópicos para a prova:\n1. Membrana Plasmática e permeabilidade seletiva.\n2. Mitocôndrias e respiração celular.\n3. Retículo Endoplasmático e Complexo de Golgi.\n\n📌 Revisar o ciclo de Krebs!",
                        "estudos");
                n1.setFavorito(true);
                n1.setFixado(true);

                Nota n2 = new Nota("Metas do Projeto: Trimestre 4",
                        "[X] Alinhamento com equipe de design\n[X] Paleta moderna (Azul, Verde e Lilás)\n[ ] Apresentação de resultados na sexta-feira às 14h\n[ ] Entrega final do relatório",
                        "trabalho");
                n2.setFavorito(true);

                Nota n3 = new Nota("Livros & Hábitos Saudáveis",
                        "1. Ler 20 páginas por dia.\n2. Tomar 2 litros de água.\n3. Caminhada matinal de 30 minutos.",
                        "pessoal");

                lista.add(n1);
                lista.add(n2);
                lista.add(n3);
                salvar(lista);
                return lista;
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(file), "UTF-8"))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.trim().isEmpty()) continue;
                    String[] parts = line.split("###", -1);
                    if (parts.length >= 7) {
                        Nota n = new Nota(parts[1], parts[2].replace("<NL>", "\n"), parts[3]);
                        n.id = parts[0];
                        n.favorito = Boolean.parseBoolean(parts[4]);
                        n.fixado = Boolean.parseBoolean(parts[5]);
                        try { n.atualizadoEm = Long.parseLong(parts[6]); } catch (Exception ignored) {}
                        lista.add(n);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return lista;
        }

        public static void salvar(List<Nota> lista) {
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(ARQUIVO), "UTF-8"))) {
                for (Nota n : lista) {
                    String conteudoFormatado = n.getConteudo().replace("\n", "<NL>").replace("\r", "");
                    writer.write(n.getId() + "###" + n.getTitulo() + "###" + conteudoFormatado + "###" +
                            n.getCategoria() + "###" + n.isFavorito() + "###" + n.isFixado() + "###" + n.getAtualizadoEm());
                    writer.newLine();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // Cores do Tema Moderno (Azul, Verde, Lilás e Branco)
    public static final Color COR_AZUL = new Color(37, 99, 235);
    public static final Color COR_AZUL_CLARO = new Color(219, 234, 254);
    public static final Color COR_VERDE = new Color(5, 150, 105);
    public static final Color COR_VERDE_CLARO = new Color(209, 250, 229);
    public static final Color COR_LILAS = new Color(124, 58, 237);
    public static final Color COR_LILAS_CLARO = new Color(237, 233, 254);
    public static final Color COR_AMARELO_FAV = new Color(245, 158, 11);

    // Estado da Aplicação
    private List<Nota> todasNotas = new ArrayList<>();
    private boolean modoEscuro = false;
    private String categoriaFiltro = "todas";
    private String textoPesquisa = "";

    // Componentes de Interface
    private JPanel painelLista;
    private JTextField campoPesquisa;
    private JLabel labelStatus;
    private JButton btnModoEscuro;
    private JPanel painelContainer;
    private JScrollPane scrollPane;

    public BlocoDeNotasApp() {
        super("Bloco de Notas • Java Mobile");
        todasNotas = BancoNotas.carregar();
        configurarJanela();
        construirInterface();
        atualizarLista();
    }

    private void configurarJanela() {
        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                confirmarSaida();
            }
        });

        // Formato Celular Realista (proporção 9:18 ~ 420x780 px)
        setSize(430, 780);
        setMinimumSize(new Dimension(380, 680));
        setLocationRelativeTo(null);
        setResizable(true);
    }

    private void construirInterface() {
        painelContainer = new JPanel(new BorderLayout());
        painelContainer.setBackground(getCorFundo());

        // 1. Barra Superior do Celular (Dynamic Island & Status)
        JPanel topoCelular = new JPanel(new BorderLayout());
        topoCelular.setBackground(modoEscuro ? new Color(15, 23, 42) : Color.WHITE);
        topoCelular.setBorder(new MatteBorder(0, 0, 1, 0, modoEscuro ? new Color(30, 41, 59) : new Color(226, 232, 240)));

        // Notificação / Ícone e Título
        JPanel painelHeader = new JPanel(new BorderLayout());
        painelHeader.setOpaque(false);
        painelHeader.setBorder(new EmptyBorder(10, 14, 8, 14));

        JLabel lblTitulo = new JLabel("📱 Bloco de Notas");
        lblTitulo.setFont(new Font("Segoe UI", Font.BOLD, 16));
        lblTitulo.setForeground(modoEscuro ? Color.WHITE : new Color(15, 23, 42));

        JLabel lblSub = new JLabel("Java Nativo • Acessível");
        lblSub.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        lblSub.setForeground(COR_VERDE);

        JPanel pnlTitulos = new JPanel(new GridLayout(2, 1));
        pnlTitulos.setOpaque(false);
        pnlTitulos.add(lblTitulo);
        pnlTitulos.add(lblSub);

        // Botões de Ação do Header (Modo Escuro, Sair)
        JPanel acoesHeader = new JPanel(new FlowLayout(FlowLayout.RIGHT, 6, 0));
        acoesHeader.setOpaque(false);

        btnModoEscuro = criarBotaoRedondo(modoEscuro ? "☀️ Claro" : "🌙 Escuro", new Color(100, 116, 139));
        btnModoEscuro.addActionListener(e -> alternarModoEscuro());

        JButton btnSair = criarBotaoRedondo("🚪 Sair", new Color(225, 29, 72));
        btnSair.addActionListener(e -> confirmarSaida());

        acoesHeader.add(btnModoEscuro);
        acoesHeader.add(btnSair);

        painelHeader.add(pnlTitulos, BorderLayout.WEST);
        painelHeader.add(acoesHeader, BorderLayout.EAST);

        // Barra de Pesquisa
        JPanel painelBusca = new JPanel(new BorderLayout());
        painelBusca.setOpaque(false);
        painelBusca.setBorder(new EmptyBorder(0, 14, 10, 14));

        campoPesquisa = new JTextField();
        campoPesquisa.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        campoPesquisa.setBorder(new CompoundBorder(
                new LineBorder(modoEscuro ? new Color(51, 65, 85) : new Color(203, 213, 225), 1, true),
                new EmptyBorder(6, 10, 6, 10)
        ));
        campoPesquisa.setBackground(modoEscuro ? new Color(30, 41, 59) : new Color(241, 245, 249));
        campoPesquisa.setForeground(modoEscuro ? Color.WHITE : new Color(15, 23, 42));
        campoPesquisa.setCaretColor(COR_AZUL);
        campoPesquisa.setToolTipText("Digite para pesquisar em tempo real...");

        campoPesquisa.addKeyListener(new KeyAdapter() {
            @Override
            public void keyReleased(KeyEvent e) {
                textoPesquisa = campoPesquisa.getText().trim().toLowerCase();
                atualizarLista();
            }
        });

        JLabel lblLupa = new JLabel("🔍 ");
        lblLupa.setBorder(new EmptyBorder(0, 4, 0, 0));
        painelBusca.add(lblLupa, BorderLayout.WEST);
        painelBusca.add(campoPesquisa, BorderLayout.CENTER);

        topoCelular.add(painelHeader, BorderLayout.NORTH);
        topoCelular.add(painelBusca, BorderLayout.SOUTH);

        // 2. Barra de Categorias (Filtros: Todas, Estudos, Trabalho, Pessoal, Favoritos)
        JPanel painelCategorias = new JPanel(new FlowLayout(FlowLayout.CENTER, 5, 8));
        painelCategorias.setOpaque(false);

        painelCategorias.add(criarBotaoFiltro("Todas", "todas", new Color(15, 23, 42)));
        painelCategorias.add(criarBotaoFiltro("Estudos", "estudos", COR_AZUL));
        painelCategorias.add(criarBotaoFiltro("Trabalho", "trabalho", COR_VERDE));
        painelCategorias.add(criarBotaoFiltro("Pessoal", "pessoal", COR_LILAS));
        painelCategorias.add(criarBotaoFiltro("★ Favoritos", "favoritos", COR_AMARELO_FAV));

        JPanel topoCompleto = new JPanel(new BorderLayout());
        topoCompleto.setOpaque(false);
        topoCompleto.add(topoCelular, BorderLayout.NORTH);
        topoCompleto.add(painelCategorias, BorderLayout.SOUTH);

        painelContainer.add(topoCompleto, BorderLayout.NORTH);

        // 3. Área Central de Rolagem de Anotações (Lista de Cards)
        painelLista = new JPanel();
        painelLista.setLayout(new BoxLayout(painelLista, BoxLayout.Y_AXIS));
        painelLista.setOpaque(false);
        painelLista.setBorder(new EmptyBorder(6, 12, 80, 12));

        scrollPane = new JScrollPane(painelLista);
        scrollPane.setBorder(null);
        scrollPane.setOpaque(false);
        scrollPane.getViewport().setOpaque(false);
        scrollPane.getVerticalScrollBar().setUnitIncrement(16);

        // Painel com Sobreposição para o Botão Flutuante (FAB)
        JLayeredPane layeredPane = new JLayeredPane();
        layeredPane.setLayout(null);

        // 4. Barra Inferior com Botão Flutuante (+ Nova Anotação)
        JPanel painelInferior = new JPanel(new BorderLayout());
        painelInferior.setOpaque(false);
        painelInferior.setBorder(new EmptyBorder(8, 14, 12, 14));

        JButton btnNovaNota = new JButton("＋  Nova Anotação");
        btnNovaNota.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnNovaNota.setForeground(Color.WHITE);
        btnNovaNota.setBackground(COR_AZUL);
        btnNovaNota.setFocusPainted(false);
        btnNovaNota.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnNovaNota.setBorder(new CompoundBorder(
                new LineBorder(COR_AZUL, 1, true),
                new EmptyBorder(12, 20, 12, 20)
        ));
        btnNovaNota.addActionListener(e -> abrirEditorNota(null));

        painelInferior.add(btnNovaNota, BorderLayout.CENTER);

        painelContainer.add(scrollPane, BorderLayout.CENTER);
        painelContainer.add(painelInferior, BorderLayout.SOUTH);

        setContentPane(painelContainer);
    }

    private Color getCorFundo() {
        return modoEscuro ? new Color(15, 23, 42) : new Color(248, 250, 252);
    }

    private Color getCorCard() {
        return modoEscuro ? new Color(30, 41, 59) : Color.WHITE;
    }

    private Color getCorTexto() {
        return modoEscuro ? new Color(241, 245, 249) : new Color(15, 23, 42);
    }

    private JButton criarBotaoRedondo(String texto, Color bg) {
        JButton btn = new JButton(texto);
        btn.setFont(new Font("Segoe UI", Font.BOLD, 11));
        btn.setForeground(Color.WHITE);
        btn.setBackground(bg);
        btn.setFocusPainted(false);
        btn.setBorder(new CompoundBorder(
                new LineBorder(bg, 1, true),
                new EmptyBorder(5, 10, 5, 10)
        ));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        return btn;
    }

    private JButton criarBotaoFiltro(String label, String id, Color corAtiva) {
        JButton btn = new JButton(label);
        boolean ativo = categoriaFiltro.equals(id);

        btn.setFont(new Font("Segoe UI", ativo ? Font.BOLD : Font.PLAIN, 11));
        btn.setFocusPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));

        if (ativo) {
            btn.setBackground(corAtiva);
            btn.setForeground(Color.WHITE);
        } else {
            btn.setBackground(modoEscuro ? new Color(30, 41, 59) : Color.WHITE);
            btn.setForeground(modoEscuro ? new Color(203, 213, 225) : new Color(71, 85, 105));
        }

        btn.setBorder(new CompoundBorder(
                new LineBorder(ativo ? corAtiva : (modoEscuro ? new Color(51, 65, 85) : new Color(226, 232, 240)), 1, true),
                new EmptyBorder(4, 8, 4, 8)
        ));

        btn.addActionListener(e -> {
            categoriaFiltro = id;
            atualizarLista();
            // Reconstruir para atualizar os estados visuais dos botões
            painelContainer.removeAll();
            construirInterface();
            painelContainer.revalidate();
            painelContainer.repaint();
            atualizarLista();
        });

        return btn;
    }

    // Atualiza a exibição das notas com base na pesquisa e filtro de categoria
    private void atualizarLista() {
        painelLista.removeAll();

        List<Nota> filtradas = new ArrayList<>();
        for (Nota n : todasNotas) {
            // Filtro por categoria
            if (categoriaFiltro.equals("favoritos")) {
                if (!n.isFavorito()) continue;
            } else if (!categoriaFiltro.equals("todas")) {
                if (!n.getCategoria().equalsIgnoreCase(categoriaFiltro)) continue;
            }

            // Filtro por busca
            if (!textoPesquisa.isEmpty()) {
                boolean matchTitulo = n.getTitulo().toLowerCase().contains(textoPesquisa);
                boolean matchConteudo = n.getConteudo().toLowerCase().contains(textoPesquisa);
                if (!matchTitulo && !matchConteudo) continue;
            }

            filtradas.add(n);
        }

        // Ordenar: Fixadas primeiro, depois por data decrescente
        filtradas.sort((a, b) -> {
            if (a.isFixado() && !b.isFixado()) return -1;
            if (!a.isFixado() && b.isFixado()) return 1;
            return Long.compare(b.getAtualizadoEm(), a.getAtualizadoEm());
        });

        if (filtradas.isEmpty()) {
            JPanel emptyPanel = new JPanel(new GridLayout(3, 1));
            emptyPanel.setOpaque(false);
            emptyPanel.setBorder(new EmptyBorder(40, 20, 20, 20));

            JLabel lblVazioIcon = new JLabel("📝", SwingConstants.CENTER);
            lblVazioIcon.setFont(new Font("Segoe UI", Font.PLAIN, 40));

            JLabel lblVazioTxt = new JLabel("Nenhuma anotação encontrada", SwingConstants.CENTER);
            lblVazioTxt.setFont(new Font("Segoe UI", Font.BOLD, 14));
            lblVazioTxt.setForeground(getCorTexto());

            JLabel lblVazioSub = new JLabel("Toque em 'Nova Anotação' abaixo para começar.", SwingConstants.CENTER);
            lblVazioSub.setFont(new Font("Segoe UI", Font.PLAIN, 12));
            lblVazioSub.setForeground(Color.GRAY);

            emptyPanel.add(lblVazioIcon);
            emptyPanel.add(lblVazioTxt);
            emptyPanel.add(lblVazioSub);

            painelLista.add(emptyPanel);
        } else {
            for (Nota n : filtradas) {
                painelLista.add(criarCardNota(n));
                painelLista.add(Box.createRigidArea(new Dimension(0, 10)));
            }
        }

        painelLista.revalidate();
        painelLista.repaint();
    }

    // Cria o Card moderno da anotação com cantos suaves e botões de ação
    private JPanel criarCardNota(Nota nota) {
        JPanel card = new JPanel(new BorderLayout(8, 8));
        card.setBackground(getCorCard());
        card.setMaximumSize(new Dimension(Integer.MAX_VALUE, 150));

        Color bordaColor = modoEscuro ? new Color(51, 65, 85) : new Color(226, 232, 240);
        if (nota.isFixado()) {
            bordaColor = COR_AZUL;
        }

        card.setBorder(new CompoundBorder(
                new LineBorder(bordaColor, nota.isFixado() ? 2 : 1, true),
                new EmptyBorder(12, 14, 12, 14)
        ));

        // Topo do card: Tag de Categoria e Favorito
        JPanel cardHeader = new JPanel(new BorderLayout());
        cardHeader.setOpaque(false);

        Color corTagBg, corTagTexto;
        String nomeTag;
        if (nota.getCategoria().equalsIgnoreCase("trabalho")) {
            corTagBg = COR_VERDE_CLARO;
            corTagTexto = COR_VERDE;
            nomeTag = "TRABALHO";
        } else if (nota.getCategoria().equalsIgnoreCase("pessoal")) {
            corTagBg = COR_LILAS_CLARO;
            corTagTexto = COR_LILAS;
            nomeTag = "PESSOAL";
        } else {
            corTagBg = COR_AZUL_CLARO;
            corTagTexto = COR_AZUL;
            nomeTag = "ESTUDOS";
        }

        JLabel lblTag = new JLabel(" " + nomeTag + " ");
        lblTag.setOpaque(true);
        lblTag.setBackground(corTagBg);
        lblTag.setForeground(corTagTexto);
        lblTag.setFont(new Font("Segoe UI", Font.BOLD, 10));
        lblTag.setBorder(new EmptyBorder(2, 6, 2, 6));

        JButton btnFav = new JButton(nota.isFavorito() ? "★" : "☆");
        btnFav.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnFav.setForeground(nota.isFavorito() ? COR_AMARELO_FAV : Color.GRAY);
        btnFav.setBorder(null);
        btnFav.setContentAreaFilled(false);
        btnFav.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnFav.addActionListener(e -> {
            nota.setFavorito(!nota.isFavorito());
            BancoNotas.salvar(todasNotas);
            atualizarLista();
        });

        cardHeader.add(lblTag, BorderLayout.WEST);
        cardHeader.add(btnFav, BorderLayout.EAST);

        // Corpo do card: Título e Prévia
        JPanel cardBody = new JPanel(new GridLayout(2, 1, 2, 2));
        cardBody.setOpaque(false);

        JLabel lblTitulo = new JLabel(nota.getTitulo());
        lblTitulo.setFont(new Font("Segoe UI", Font.BOLD, 14));
        lblTitulo.setForeground(getCorTexto());

        String preview = nota.getConteudo().replace("\n", " ");
        if (preview.length() > 65) preview = preview.substring(0, 65) + "...";
        JLabel lblPreview = new JLabel(preview.isEmpty() ? "(Sem conteúdo)" : preview);
        lblPreview.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        lblPreview.setForeground(modoEscuro ? new Color(148, 163, 184) : new Color(100, 116, 139));

        cardBody.add(lblTitulo);
        cardBody.add(lblPreview);

        // Rodapé do card: Data e Botões (Visualizar, Editar, Excluir)
        JPanel cardFooter = new JPanel(new BorderLayout());
        cardFooter.setOpaque(false);

        JLabel lblData = new JLabel(nota.getDataFormatada());
        lblData.setFont(new Font("Segoe UI", Font.PLAIN, 10));
        lblData.setForeground(Color.GRAY);

        JPanel btnActions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 4, 0));
        btnActions.setOpaque(false);

        JButton btnVer = new JButton("Ver");
        estilizarBotaoAcao(btnVer, COR_AZUL);
        btnVer.addActionListener(e -> abrirVisualizadorNota(nota));

        JButton btnEditar = new JButton("Editar");
        estilizarBotaoAcao(btnEditar, COR_VERDE);
        btnEditar.addActionListener(e -> abrirEditorNota(nota));

        JButton btnExcluir = new JButton("Excluir");
        estilizarBotaoAcao(btnExcluir, new Color(225, 29, 72));
        btnExcluir.addActionListener(e -> confirmarExclusaoNota(nota));

        btnActions.add(btnVer);
        btnActions.add(btnEditar);
        btnActions.add(btnExcluir);

        cardFooter.add(lblData, BorderLayout.WEST);
        cardFooter.add(btnActions, BorderLayout.EAST);

        card.add(cardHeader, BorderLayout.NORTH);
        card.add(cardBody, BorderLayout.CENTER);
        card.add(cardFooter, BorderLayout.SOUTH);

        // Clique no card abre visualizador
        card.setCursor(new Cursor(Cursor.HAND_CURSOR));
        card.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getSource() == card) {
                    abrirVisualizadorNota(nota);
                }
            }
        });

        return card;
    }

    private void estilizarBotaoAcao(JButton btn, Color cor) {
        btn.setFont(new Font("Segoe UI", Font.BOLD, 10));
        btn.setForeground(cor);
        btn.setBackground(modoEscuro ? new Color(15, 23, 42) : Color.WHITE);
        btn.setFocusPainted(false);
        btn.setBorder(new CompoundBorder(
                new LineBorder(cor, 1, true),
                new EmptyBorder(3, 8, 3, 8)
        ));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
    }

    // Modal de Criação / Edição de Anotação
    private void abrirEditorNota(Nota notaExistente) {
        JDialog dialog = new JDialog(this, notaExistente == null ? "Nova Anotação" : "Editar Anotação", true);
        dialog.setSize(380, 520);
        dialog.setLocationRelativeTo(this);

        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBackground(getCorFundo());
        panel.setBorder(new EmptyBorder(16, 16, 16, 16));

        // Título
        JTextField txtTitulo = new JTextField(notaExistente != null ? notaExistente.getTitulo() : "");
        txtTitulo.setFont(new Font("Segoe UI", Font.BOLD, 14));
        txtTitulo.setBorder(new CompoundBorder(new LineBorder(Color.LIGHT_GRAY, 1, true), new EmptyBorder(6, 8, 6, 8)));

        // Categoria
        JComboBox<String> cbCategoria = new JComboBox<>(new String[]{"Estudos", "Trabalho", "Pessoal"});
        cbCategoria.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        if (notaExistente != null) {
            if (notaExistente.getCategoria().equalsIgnoreCase("trabalho")) cbCategoria.setSelectedIndex(1);
            else if (notaExistente.getCategoria().equalsIgnoreCase("pessoal")) cbCategoria.setSelectedIndex(2);
            else cbCategoria.setSelectedIndex(0);
        }

        // Conteúdo
        JTextArea txtConteudo = new JTextArea(notaExistente != null ? notaExistente.getConteudo() : "");
        txtConteudo.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        txtConteudo.setLineWrap(true);
        txtConteudo.setWrapStyleWord(true);
        JScrollPane scrollConteudo = new JScrollPane(txtConteudo);
        scrollConteudo.setBorder(new LineBorder(Color.LIGHT_GRAY, 1, true));

        // Checkbox Favorito e Fixado
        JCheckBox chkFav = new JCheckBox("Marcar como Favorito", notaExistente != null && notaExistente.isFavorito());
        chkFav.setOpaque(false);
        chkFav.setForeground(getCorTexto());

        JCheckBox chkFix = new JCheckBox("Fixar no topo", notaExistente != null && notaExistente.isFixado());
        chkFix.setOpaque(false);
        chkFix.setForeground(getCorTexto());

        JPanel pnlChecks = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        pnlChecks.setOpaque(false);
        pnlChecks.add(chkFav);
        pnlChecks.add(chkFix);

        JPanel topoEditor = new JPanel(new GridLayout(4, 1, 4, 4));
        topoEditor.setOpaque(false);
        JLabel lblRotuloTit = new JLabel("Título da Anotação:");
        lblRotuloTit.setForeground(getCorTexto());
        topoEditor.add(lblRotuloTit);
        topoEditor.add(txtTitulo);

        JLabel lblRotuloCat = new JLabel("Categoria:");
        lblRotuloCat.setForeground(getCorTexto());
        topoEditor.add(lblRotuloCat);
        topoEditor.add(cbCategoria);

        panel.add(topoEditor, BorderLayout.NORTH);

        JPanel pnlMeio = new JPanel(new BorderLayout(4, 4));
        pnlMeio.setOpaque(false);
        JLabel lblRotuloCont = new JLabel("Conteúdo:");
        lblRotuloCont.setForeground(getCorTexto());
        pnlMeio.add(lblRotuloCont, BorderLayout.NORTH);
        pnlMeio.add(scrollConteudo, BorderLayout.CENTER);
        pnlMeio.add(pnlChecks, BorderLayout.SOUTH);

        panel.add(pnlMeio, BorderLayout.CENTER);

        // Botões Salvar e Cancelar
        JPanel pnlBotoes = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        pnlBotoes.setOpaque(false);

        JButton btnCancelar = new JButton("Cancelar");
        btnCancelar.addActionListener(e -> dialog.dispose());

        JButton btnSalvar = new JButton("💾 Salvar");
        btnSalvar.setFont(new Font("Segoe UI", Font.BOLD, 12));
        btnSalvar.setBackground(COR_AZUL);
        btnSalvar.setForeground(Color.WHITE);
        btnSalvar.setFocusPainted(false);

        btnSalvar.addActionListener(e -> {
            String tit = txtTitulo.getText().trim();
            String cont = txtConteudo.getText().trim();
            if (tit.isEmpty()) {
                JOptionPane.showMessageDialog(dialog, "Por favor, digite um título para a anotação.", "Aviso", JOptionPane.WARNING_MESSAGE);
                return;
            }

            String cat = "estudos";
            int idx = cbCategoria.getSelectedIndex();
            if (idx == 1) cat = "trabalho";
            else if (idx == 2) cat = "pessoal";

            if (notaExistente != null) {
                notaExistente.setTitulo(tit);
                notaExistente.setConteudo(cont);
                notaExistente.setCategoria(cat);
                notaExistente.setFavorito(chkFav.isSelected());
                notaExistente.setFixado(chkFix.isSelected());
            } else {
                Nota nova = new Nota(tit, cont, cat);
                nova.setFavorito(chkFav.isSelected());
                nova.setFixado(chkFix.isSelected());
                todasNotas.add(0, nova);
            }

            BancoNotas.salvar(todasNotas);
            atualizarLista();
            dialog.dispose();
            JOptionPane.showMessageDialog(this, "Anotação salva com sucesso!", "Sucesso", JOptionPane.INFORMATION_MESSAGE);
        });

        pnlBotoes.add(btnCancelar);
        pnlBotoes.add(btnSalvar);
        panel.add(pnlBotoes, BorderLayout.SOUTH);

        dialog.setContentPane(panel);
        dialog.setVisible(true);
    }

    // Modal de Leitura / Visualização Completa da Anotação
    private void abrirVisualizadorNota(Nota nota) {
        JDialog dialog = new JDialog(this, "Visualizar Anotação", true);
        dialog.setSize(380, 480);
        dialog.setLocationRelativeTo(this);

        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBackground(getCorFundo());
        panel.setBorder(new EmptyBorder(16, 16, 16, 16));

        // Cabeçalho da nota
        JPanel pnlCabecalho = new JPanel(new GridLayout(3, 1, 2, 2));
        pnlCabecalho.setOpaque(false);

        JLabel lblTit = new JLabel(nota.getTitulo());
        lblTit.setFont(new Font("Segoe UI", Font.BOLD, 16));
        lblTit.setForeground(getCorTexto());

        JLabel lblCat = new JLabel("Categoria: " + nota.getCategoria().toUpperCase() + " • " + nota.getDataFormatada());
        lblCat.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        lblCat.setForeground(Color.GRAY);

        pnlCabecalho.add(lblTit);
        pnlCabecalho.add(lblCat);

        JTextArea txtLeitura = new JTextArea(nota.getConteudo());
        txtLeitura.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        txtLeitura.setEditable(false);
        txtLeitura.setLineWrap(true);
        txtLeitura.setWrapStyleWord(true);
        txtLeitura.setBackground(getCorCard());
        txtLeitura.setForeground(getCorTexto());
        JScrollPane scroll = new JScrollPane(txtLeitura);
        scroll.setBorder(new LineBorder(Color.LIGHT_GRAY, 1, true));

        // Botões de Voltar, Editar e Excluir
        JPanel pnlBotoes = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        pnlBotoes.setOpaque(false);

        JButton btnVoltar = new JButton("Voltar");
        btnVoltar.addActionListener(e -> dialog.dispose());

        JButton btnEdit = new JButton("Editar");
        btnEdit.setBackground(COR_VERDE);
        btnEdit.setForeground(Color.WHITE);
        btnEdit.addActionListener(e -> {
            dialog.dispose();
            abrirEditorNota(nota);
        });

        JButton btnDel = new JButton("Excluir");
        btnDel.setBackground(new Color(225, 29, 72));
        btnDel.setForeground(Color.WHITE);
        btnDel.addActionListener(e -> {
            dialog.dispose();
            confirmarExclusaoNota(nota);
        });

        pnlBotoes.add(btnVoltar);
        pnlBotoes.add(btnEdit);
        pnlBotoes.add(btnDel);

        panel.add(pnlCabecalho, BorderLayout.NORTH);
        panel.add(scroll, BorderLayout.CENTER);
        panel.add(pnlBotoes, BorderLayout.SOUTH);

        dialog.setContentPane(panel);
        dialog.setVisible(true);
    }

    // Confirmação de Exclusão
    private void confirmarExclusaoNota(Nota nota) {
        int resp = JOptionPane.showConfirmDialog(
                this,
                "Deseja realmente excluir a anotação:\n\"" + nota.getTitulo() + "\"?",
                "Confirmar Exclusão",
                JOptionPane.YES_NO_OPTION,
                JOptionPane.WARNING_MESSAGE
        );

        if (resp == JOptionPane.YES_OPTION) {
            todasNotas.remove(nota);
            BancoNotas.salvar(todasNotas);
            atualizarLista();
            JOptionPane.showMessageDialog(this, "Anotação excluída com sucesso.", "Excluída", JOptionPane.INFORMATION_MESSAGE);
        }
    }

    // Confirmação de Saída
    private void confirmarSaida() {
        int resp = JOptionPane.showConfirmDialog(
                this,
                "Deseja realmente sair do aplicativo?\nSuas anotações estão todas salvas com segurança no arquivo local.",
                "Confirmar Saída",
                JOptionPane.YES_NO_OPTION,
                JOptionPane.QUESTION_MESSAGE
        );

        if (resp == JOptionPane.YES_OPTION) {
            System.exit(0);
        }
    }

    // Alternar Tema Claro / Escuro
    private void alternarModoEscuro() {
        modoEscuro = !modoEscuro;
        btnModoEscuro.setText(modoEscuro ? "☀️ Claro" : "🌙 Escuro");
        painelContainer.setBackground(getCorFundo());
        atualizarLista();
        repaint();
    }

    // Método Principal de Execução em Java
    public static void main(String[] args) {
        // Look & Feel do Sistema
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception ignored) {}

        SwingUtilities.invokeLater(() -> {
            BlocoDeNotasApp app = new BlocoDeNotasApp();
            app.setVisible(true);
        });
    }
}
