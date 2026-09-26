import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Lock,
  User,
  LogOut,
  PackagePlus,
  FileSpreadsheet,
  Search,
  Trash2,
  Edit3,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Package,
  DollarSign,
  Layers,
  PlusCircle,
} from "lucide-react";

const API_URL = "http://localhost:3000";

export default function App() {
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Estado do Sistema de Produtos
  const [activeTab, setActiveTab] = useState("list");
  const [products, setProducts] = useState([]);

  // Estados de Formulário
  const [formData, setFormData] = useState({
    id: null,
    nome: "",
    sku: "",
    categoria: "Geral",
    preco: "",
    estoque: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Estados de Filtro/Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Estados da Importação por Excel
  const [selectedFile, setSelectedFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  // Auxiliar para converter números com segurança
  const parseNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const parsed = parseFloat(String(val).replace(",", "."));
    return isNaN(parsed) ? 0 : parsed;
  };

  // --- CÁLCULOS DINÂMICOS DAS MÉTRICAS (SEM DEPENDER DE ESTADOS SEPARADOS) ---
  const totalProdutos = products.length;

  const valorTotalEstoque = products.reduce((acc, p) => {
    const preco = parseNumber(p.price ?? p.preco);
    const qtd = parseNumber(p.quantity ?? p.estoque);
    return acc + preco * qtd;
  }, 0);

  const totalCategorias = new Set(
    products
      .map((p) => (p.category || p.categoria || "Geral").trim())
      .filter((cat) => cat.length > 0),
  ).size;

  // --- 1. BUSCAR PRODUTOS DO BACK-END ---
  const carregarProdutos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const dados = await res.json();
        setProducts([...dados]);
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    }
  };

  // Carrega produtos e liga o WebSocket após autenticação
  useEffect(() => {
    if (isAuthenticated) {
      carregarProdutos();

      // Conexão Socket.IO para Atualizações em Tempo Real
      const socket = io(API_URL, {
        transports: ["websocket", "polling"],
      });

      socket.on("productsUpdated", (updatedProducts) => {
        if (Array.isArray(updatedProducts)) {
          setProducts(updatedProducts.map((p) => ({ ...p })));
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated]);

  // --- 2. LOGIN REAL NO BACK-END (POST /auth/login) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem("token", data.access_token);
        setIsAuthenticated(true);
        setLoginError("");
      } else {
        setLoginError(data.message || "Usuário ou senha incorretos.");
      }
    } catch {
      setLoginError(
        "Não foi possível conectar ao servidor NestJS (http://localhost:3000). O servidor está ligado?",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCredentials({ email: "", password: "" });
    setProducts([]);
  };

  // --- PREPARAR EDIÇÃO DE PRODUTO ---
  const handleEditProduct = (product) => {
    setFormData({
      id: product.id,
      nome: product.name || product.nome || "",
      sku: product.sku || "",
      categoria: product.category || product.categoria || "Geral",
      preco: product.price ?? product.preco ?? "",
      estoque: product.quantity ?? product.estoque ?? "",
    });
    setEditingId(product.id);
    setActiveTab("create");
  };

  // --- 3. CADASTRAR/EDITAR PRODUTO ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.preco) return;

    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `${API_URL}/products/${editingId}`
        : `${API_URL}/products`;
      const method = editingId ? "PUT" : "POST";

      const precoNum = parseNumber(formData.preco);
      const estoqueNum = parseNumber(formData.estoque);

      const payload = {
        name: formData.nome,
        sku: formData.sku,
        category: formData.categoria || "Geral",
        price: precoNum,
        quantity: estoqueNum,
      };

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormData({
          id: null,
          nome: "",
          sku: "",
          categoria: "Geral",
          preco: "",
          estoque: "",
        });
        setEditingId(null);
        setActiveTab("list");
        await carregarProdutos();
      } else {
        const errData = await res.json();
        alert(
          `Erro ao salvar produto: ${errData.message || "Verifique os dados."}`,
        );
      }
    } catch (err) {
      console.error("Erro no salvamento:", err);
    }
  };

  // --- 4. EXCLUIR PRODUTO ---
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          await carregarProdutos();
        } else {
          alert("Erro ao excluir produto no back-end.");
        }
      } catch (err) {
        console.error("Erro na exclusão:", err);
        alert("Erro ao conectar com o servidor.");
      }
    }
  };

  // --- 5. ENVIAR EXCEL PARA O BACK-END ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImportStatus({
        type: "info",
        message: `Arquivo "${file.name}" selecionado.`,
      });
    }
  };

  const confirmImport = async () => {
    if (!selectedFile) return;

    const token = localStorage.getItem("token");
    const dataForm = new FormData();
    dataForm.append("file", selectedFile);

    try {
      const res = await fetch(`${API_URL}/products/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataForm,
      });

      const resData = await res.json();

      if (!res.ok) {
        setImportStatus({
          type: "error",
          message: resData.message || "Erro ao processar importação.",
        });
      } else {
        setImportStatus({
          type: "success",
          message: resData.message || "Importação realizada com sucesso!",
        });
        setSelectedFile(null);
        await carregarProdutos();
        setTimeout(() => {
          setActiveTab("list");
          setImportStatus(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Erro ao enviar o arquivo para o back-end:", err);
      setImportStatus({
        type: "error",
        message: "Erro ao enviar o arquivo para o back-end.",
      });
    }
  };

  // Filtros em memória
  const filteredProducts = products.filter((product) => {
    const nome = product.name || product.nome || "";
    const sku = product.sku || "";
    const categoria = product.category || product.categoria || "Geral";

    const matchesSearch =
      nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas" || categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "Todas",
    ...new Set(products.map((p) => p.category || p.categoria || "Geral")),
  ];

  // --- TELA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-600/10 text-blue-500 rounded-xl mb-2">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Acesso ao Sistema</h1>
            <p className="text-slate-400 text-sm">
              Conectado ao NestJS (http://localhost:3000)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                E-mail / Usuário
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  placeholder="admin@admin.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  placeholder="123456"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              Entrar
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-500 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg text-white">
              StockManager (API Real)
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Métricas Calculadas Dinamicamente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total de Produtos
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {totalProdutos}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Valor em Estoque
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                <span>R$&nbsp;</span>
                <span>
                  {valorTotalEstoque.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Categorias
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {totalCategorias}
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navegação de Abas */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-900 p-2 rounded-xl border border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab("list");
                setEditingId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "list"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Package className="w-4 h-4" />
              Produtos
            </button>
            <button
              onClick={() => {
                setActiveTab("create");
                if (!editingId)
                  setFormData({
                    id: null,
                    nome: "",
                    sku: "",
                    categoria: "Geral",
                    preco: "",
                    estoque: "",
                  });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "create"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              {editingId ? "Editar Produto" : "Novo Produto"}
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "import"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Importar Excel
            </button>
          </div>
        </div>

        {/* ABA 1: LISTA DE PRODUTOS */}
        {activeTab === "list" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Preço</th>
                    <th className="p-4">Estoque</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => {
                      const precoFormatted = parseNumber(p.price ?? p.preco);
                      const qtdFormatted = parseNumber(p.quantity ?? p.estoque);

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-800/50 transition"
                        >
                          <td className="p-4 font-mono text-xs text-slate-400">
                            {p.sku || "-"}
                          </td>
                          <td className="p-4 font-semibold text-white">
                            {p.name || p.nome}
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-xs border border-slate-700">
                              {p.category || p.categoria || "Geral"}
                            </span>
                          </td>
                          <td className="p-4 text-emerald-400 font-medium">
                            R$ {precoFormatted.toFixed(2)}
                          </td>
                          <td className="p-4">{qtdFormatted} un</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditProduct(p)}
                              className="p-1.5 hover:bg-slate-700 rounded-md text-blue-400 transition"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 hover:bg-slate-700 rounded-md text-red-400 transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-slate-500"
                      >
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: CADASTRO MANUAL */}
        {activeTab === "create" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-500" />
              {editingId ? "Editar Produto" : "Cadastrar Novo Produto"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Ex: Teclado Mecânico"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="Ex: TC-001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    placeholder="Ex: Periféricos"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.preco}
                    onChange={(e) =>
                      setFormData({ ...formData, preco: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    value={formData.estoque}
                    onChange={(e) =>
                      setFormData({ ...formData, estoque: e.target.value })
                    }
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition text-sm"
                >
                  {editingId ? "Salvar Alterações" : "Cadastrar Produto"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("list");
                    setEditingId(null);
                  }}
                  className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ABA 3: IMPORTAR EXCEL */}
        {activeTab === "import" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                Importar Produtos via Excel / CSV (Servidor)
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                O arquivo será enviado para processamento diretamente no NestJS.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 bg-slate-950/50 rounded-xl p-8 text-center space-y-4 transition">
              <Upload className="w-10 h-10 text-slate-500 mx-auto" />
              <div>
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg inline-block transition">
                  Selecionar Arquivo Excel
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <p className="text-emerald-400 text-sm mt-3 font-medium">
                    Pronto para enviar: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            {importStatus && (
              <div
                className={`p-4 rounded-lg text-sm flex items-center gap-3 ${
                  importStatus.type === "error"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : importStatus.type === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}

            {selectedFile && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={confirmImport}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Enviar para o Back-end NestJS
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
