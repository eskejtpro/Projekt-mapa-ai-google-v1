import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Layers, 
  Database, 
  Cpu, 
  Smartphone, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  ListTodo, 
  BookOpen, 
  Compass, 
  GitBranch, 
  Code2, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

// Przykładowe presety kodu do analizy
const CODE_PRESETS = [
  {
    id: 'vm-antipattern',
    title: 'Błąd: ViewModel z blokowaniem Main & collectAsState',
    category: 'ViewModel & Coroutines',
    type: 'warning',
    code: `// Przykład kodu z poważnymi problemami architektonicznymi
class BadUserViewModel : ViewModel() {
    // Problem 1: Użycie MutableStateFlow bez enkapsulacji (brak podziału na private _state i public state)
    val userList = MutableStateFlow<List<User>>(emptyList())
    val isLoading = MutableStateFlow(false)

    fun loadUsers() {
        // Problem 2: Użycie GlobalScope lub brak kontroli Dispatcherów
        GlobalScope.launch {
            isLoading.value = true
            // Problem 3: Blokujące wywołanie sieciowe/bazodanowe bez withContext(Dispatchers.IO)
            val data = RetrofitClient.api.fetchUsersSync().execute().body()
            userList.value = data ?: emptyList()
            isLoading.value = false
        }
    }
}

@Composable
fun UserScreen(viewModel: BadUserViewModel) {
    // Problem 4: collectAsState() nie zwalnia subskrypcji w tle (potencjalny wyciek / praca w tle)
    val users by viewModel.userList.collectAsState()
    
    // Problem 5: Brak klucza w LazyColumn
    LazyColumn {
        items(users) { user ->
            Text(user.name)
        }
    }
}`,
    explanation: 'Ten kod zawiera 5 krytycznych błędów: wyciek korutyny przez GlobalScope, blokowanie wątku, brak enkapsulacji stanu, niebezpieczny collectAsState w Compose oraz brak stabilnego klucza w LazyColumn.'
  },
  {
    id: 'room-offline-first',
    title: 'Wzorzec: Room Offline-First SSOT z Flow',
    category: 'Data & Room',
    type: 'success',
    code: `@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getProductsFlow(): Flow<List<ProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertProducts(products: List<ProductEntity>)
}

class ProductRepositoryImpl @Inject constructor(
    private val productDao: ProductDao,
    private val apiService: ProductApiService,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) : ProductRepository {

    // Single Source of Truth (SSOT): UI zawsze czyta z bazy danych
    override fun observeProducts(): Flow<List<Product>> =
        productDao.getProductsFlow()
            .map { entities -> entities.map { it.toDomain() } }
            .flowOn(ioDispatcher)

    // Synchronizacja w tle z obsługą błędów w Result
    override suspend fun refreshProducts(): Result<Unit> = withContext(ioDispatcher) {
        runCatching {
            val remoteData = apiService.fetchProducts()
            productDao.upsertProducts(remoteData.map { it.toEntity() })
        }
    }
}`,
    explanation: 'Wzorcowa implementacja Offline-First: baza danych Room stanowi jedyne źródło prawdy (SSOT), dane emitowane są jako reaktywny Flow, a operacje I/O bezpiecznie izolowane na Dispatchers.IO.'
  },
  {
    id: 'compose-m3-clean',
    title: 'Wzorzec: Compose Material 3 & State Hoisting',
    category: 'UI & Compose',
    type: 'success',
    code: `@Composable
fun ProductListScreen(
    viewModel: ProductViewModel = hiltViewModel(),
    onProductClick: (String) -> Unit
) {
    // Prawidłowy odbiór stanu uwzględniający cykl życia Androida
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    ProductListContent(
        uiState = uiState,
        onProductClick = onProductClick,
        onRetry = viewModel::refresh
    )
}

@Composable
fun ProductListContent(
    uiState: ProductUiState,
    onProductClick: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.products_title)) }
            )
        }
    ) { paddingValues ->
        when (uiState) {
            is ProductUiState.Loading -> LoadingIndicator(modifier = Modifier.padding(paddingValues))
            is ProductUiState.Error -> ErrorView(
                message = uiState.message,
                onRetry = onRetry,
                modifier = Modifier.padding(paddingValues)
            )
            is ProductUiState.Success -> {
                LazyColumn(
                    modifier = Modifier.padding(paddingValues),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(
                        items = uiState.items,
                        key = { it.id } // Stabilny klucz dla optymalizacji rekompozycji
                    ) { item ->
                        ProductCard(item = item, onClick = { onProductClick(item.id) })
                    }
                }
            }
        }
    }
}`,
    explanation: 'Zgodność z wytycznymi Google: podział na Screen (zależny od VM) i Content (stateless, testowalny), collectAsStateWithLifecycle(), stabilny klucz listy oraz modelowanie stanów Loading/Error/Success.'
  },
  {
    id: 'datastore-pattern',
    title: 'Wzorzec: Jetpack DataStore Preferences',
    category: 'Preferences & Cache',
    type: 'success',
    code: `class UserPreferencesRepository @Inject constructor(
    private val dataStore: DataStore<Preferences>,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {
    private object PreferencesKeys {
        val DARK_MODE_ENABLED = booleanPreferencesKey("dark_mode_enabled")
        val USER_AUTH_TOKEN = stringPreferencesKey("auth_token")
    }

    val isDarkMode: Flow<Boolean> = dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            preferences[PreferencesKeys.DARK_MODE_ENABLED] ?: false
        }
        .flowOn(ioDispatcher)

    suspend fun setDarkMode(enabled: Boolean) = withContext(ioDispatcher) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.DARK_MODE_ENABLED] = enabled
        }
    }
}`,
    explanation: 'Nowoczesny zamiennik SharedPreferences. Asynchroniczne I/O, obsługa błędów IOException przez catch, bezpieczne typowanie kluczy i reaktywny Flow.'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'audit' | 'inspector' | 'tasks' | 'dod' | 'docs'>('audit');
  const [selectedPreset, setSelectedPreset] = useState<string>('vm-antipattern');
  const [customCode, setCustomCode] = useState<string>(CODE_PRESETS[0].code);
  const [copied, setCopied] = useState<boolean>(false);
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'P0' | 'P1' | 'P2'>('ALL');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'ALL' | 'DONE' | 'IN_PROGRESS' | 'TODO'>('ALL');

  // Zadania projektu
  const [tasks, setTasks] = useState([
    { id: 'TASK-001', priority: 'P0', category: 'Architektura', title: 'Audyt stanu zerowego repozytorium i inwentaryzacja zasobów', status: 'DONE', verified: true },
    { id: 'TASK-002', priority: 'P0', category: 'Standardy', title: 'Ustalenie reguł AGENTS.md, .codex/config.toml, DoD', status: 'DONE', verified: true },
    { id: 'TASK-003', priority: 'P0', category: 'Narzędzia', title: 'Implementacja Studio Architekta Android (Audytor, Symulator, Doradca)', status: 'DONE', verified: true },
    { id: 'TASK-004', priority: 'P0', category: 'Baza Danych', title: 'Wzorcowa architektura Room + Offline-First z Flow (SSOT)', status: 'IN_PROGRESS', verified: false },
    { id: 'TASK-005', priority: 'P0', category: 'Stan / UI', title: 'Modelowanie ViewModel z StateFlow i collectAsStateWithLifecycle', status: 'IN_PROGRESS', verified: false },
    { id: 'TASK-006', priority: 'P1', category: 'Preferencje', title: 'DataStore Preferences z szyfrowaniem i typowaniem', status: 'TODO', verified: false },
    { id: 'TASK-007', priority: 'P1', category: 'Nawigacja', title: 'Navigation Compose Type-Safe routing bez magic strings', status: 'TODO', verified: false },
    { id: 'TASK-008', priority: 'P2', category: 'Material 3', title: 'Komponenty M3, adaptacyjny layout (Foldables, Tablety, Telefony)', status: 'TODO', verified: false },
    { id: 'TASK-009', priority: 'P0', category: 'CI/CD & Jakość', title: 'Konfiguracja reguł Detekt, ktlint i Android Lint', status: 'TODO', verified: false },
    { id: 'TASK-010', priority: 'P0', category: 'Wydanie Końcowe', title: 'Stabilizacja, weryfikacja DoD i przygotowanie do wdrożenia', status: 'TODO', verified: false },
  ]);

  // Reguły analizatora kodu w czasie rzeczywistym
  const codeAnalysis = useMemo(() => {
    const findings: { type: 'error' | 'warning' | 'success'; title: string; description: string; fix: string }[] = [];
    const code = customCode;

    // 1. Sprawdzenie GlobalScope
    if (code.includes('GlobalScope')) {
      findings.push({
        type: 'error',
        title: 'Niedozwolone użycie GlobalScope (Wyciek pamięci)',
        description: 'GlobalScope nie jest powiązany z cyklem życia komponentu Android. Prace trwają nawet po zniszczeniu ekranu.',
        fix: 'Użyj viewModelScope.launch w ViewModel lub rememberCoroutineScope() w Compose.'
      });
    }

    // 2. Sprawdzenie collectAsState vs collectAsStateWithLifecycle
    if (code.includes('.collectAsState()') && !code.includes('collectAsStateWithLifecycle')) {
      findings.push({
        type: 'error',
        title: 'Niebezpieczny odbiór stanu: collectAsState()',
        description: 'Zwykły collectAsState() kontynuuje pobieranie emisji z Flow nawet gdy aplikacja jest w tle (stan STOPPED), zużywając baterię i zasoby.',
        fix: 'Zastąp przez: val state by viewModel.state.collectAsStateWithLifecycle() z biblioteki androidx.lifecycle:lifecycle-runtime-compose.'
      });
    }

    // 3. Sprawdzenie enkapsulacji stanu (MutableStateFlow publiczny)
    if (code.includes('val ') && code.includes('MutableStateFlow') && !code.includes('private val _')) {
      findings.push({
        type: 'warning',
        title: 'Brak enkapsulacji stanu w ViewModel',
        description: 'Wystawianie MutableStateFlow jako publicznej właściwości łamie zasadę UDF (Unidirectional Data Flow) – widok może bezpośrednio mutować stan.',
        fix: 'Zastosuj wzorzec: private val _uiState = MutableStateFlow(...); val uiState: StateFlow<T> = _uiState.asStateFlow()'
      });
    }

    // 4. Sprawdzenie LazyColumn bez klucza
    if (code.includes('LazyColumn') && code.includes('items(') && !code.includes('key =')) {
      findings.push({
        type: 'warning',
        title: 'Brak stabilnego parametru key w LazyColumn/LazyRow',
        description: 'Brak klucza w items(...) zmusza silnik Jetpack Compose do rekomponowania wszystkich elementów listy przy każdej zmianie kolejności.',
        fix: 'Dodaj jawny klucz: items(items = list, key = { it.id }) { item -> ... }'
      });
    }

    // 5. Sprawdzenie wątku I/O
    if ((code.includes('fetch') || code.includes('query') || code.includes('execute()') || code.includes('insert')) && 
        !code.includes('Dispatchers.IO') && !code.includes('withContext') && !code.includes('flowOn')) {
      findings.push({
        type: 'error',
        title: 'Ryzyko blokowania głównego wątku (ANR na Dispatchers.Main)',
        description: 'Operacje sieciowe i dostęp do dysku/bazy danych nie mogą być wykonywane na wątku UI.',
        fix: 'Opakuj operacje w withContext(Dispatchers.IO) lub użyj suspend DAO z Room, które automatycznie przełącza dispatcher.'
      });
    }

    // 6. Sprawdzenie wzorców pozytywnych
    if (code.includes('collectAsStateWithLifecycle')) {
      findings.push({
        type: 'success',
        title: 'Wzorowe zarządzanie cyklem życia: collectAsStateWithLifecycle',
        description: 'Prawidłowo zatrzymuje subskrypcję strumienia, gdy widok przechodzi w tło (min Lifecycle.State.STARTED).',
        fix: 'Brak uwag. Wzorcowa praktyka Google.'
      });
    }

    if (code.includes('Single Source of Truth') || (code.includes('@Dao') && code.includes('Flow<'))) {
      findings.push({
        type: 'success',
        title: 'Architektura Offline-First (SSOT)',
        description: 'Baza Room emituje strumienie reaktywne Flow, gwarantując stałą dostępność danych bez połączenia sieciowego.',
        fix: 'Brak uwag. Wzorcowa implementacja.'
      });
    }

    if (code.includes('DataStore')) {
      findings.push({
        type: 'success',
        title: 'Nowoczesny magazyn preferencji (Jetpack DataStore)',
        description: 'Bezpieczna, asynchroniczna alternatywa dla przestarzałego SharedPreferences z pełnym wsparciem Coroutines.',
        fix: 'Brak uwag.'
      });
    }

    const score = Math.max(20, 100 - findings.filter(f => f.type === 'error').length * 30 - findings.filter(f => f.type === 'warning').length * 15);
    
    let grade = 'A+ (Świetna architektura)';
    if (score < 50) grade = 'F (Naruszenia krytyczne)';
    else if (score < 75) grade = 'C (Wymagany refaktoring)';
    else if (score < 90) grade = 'B (Drobne poprawki)';

    return { findings, score, grade };
  }, [customCode]);

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'DONE' ? 'TODO' : t.status === 'TODO' ? 'IN_PROGRESS' : 'DONE';
        return { ...t, status: nextStatus, verified: nextStatus === 'DONE' };
      }
      return t;
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter !== 'ALL' && t.priority !== taskFilter) return false;
    if (taskStatusFilter !== 'ALL' && t.status !== taskStatusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Pasek górny - Senior Architect Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-100 tracking-tight">Android Architecture Studio</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Senior Architect Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audyt, doradztwo i nadzór inżynieryjny: Kotlin 2.0 • Jetpack Compose • Material 3 • MVVM • Room SSOT • DataStore
              </p>
            </div>
          </div>

          {/* Nawigacja zakładkowa */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'audit'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Audyt Repozytorium
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'inspector'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Doradca & Analizator Kodu
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'tasks'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              Rejestr Zadań (TASKS)
            </button>
            <button
              onClick={() => setActiveTab('dod')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'dod'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Definition of Done
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'docs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Dokumentacja Architektury
            </button>
          </nav>
        </div>
      </header>

      {/* Główna treść */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* ZAKŁADKA 1: AUDYT REPOZYTORIUM */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Karta statusu audytu */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    Raport Wykonawczy Architekta • Stan Początkowy
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Faktyczny Stan Repozytorium vs Oczekiwania Projektu
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Kompleksowa weryfikacja struktury kodu, zależności, procesów ciągłości i środowiska uruchomieniowego.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Stopień gotowości bazy</div>
                    <div className="text-xl font-mono font-bold text-emerald-400">30% (Faza Inicjalizacji)</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                    <Compass className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* 3 Kluczowe Wnioski Audytu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Brak Zdalnego Repozytorium Git
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    W środowisku zastano czysty szablon AI Studio bez powiązanego remote GitHub. Brak plików AGENTS.md, ROADMAP.md, TASKS.md w kodzie źródłowym.
                  </p>
                  <div className="mt-3 text-[11px] text-emerald-400 font-medium">
                    ✓ Podjęte działanie: Wygenerowano pełną specyfikację projektową.
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Zgodność z Nowoczesnym Stosem
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ustalono bezkompromisowe wytyczne: Kotlin 2.0, Jetpack Compose, Material 3, ViewModel z StateFlow, Room jako SSOT oraz DataStore Preferences.
                  </p>
                  <div className="mt-3 text-[11px] text-emerald-400 font-medium">
                    ✓ Podjęte działanie: Wdrożono bramki jakościowe w .codex/config.toml.
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-2">
                    <Layers className="w-4 h-4" />
                    Czysta Architektura & Offline-First
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Aplikacja projektowana jest w oparciu o separację odpowiedzialności (Data, Domain, UI), zakaz blokowania wątku UI oraz reaktywny przepływ danych.
                  </p>
                  <div className="mt-3 text-[11px] text-indigo-400 font-medium">
                    ✓ Podjęte działanie: Skonstruowano kryteria Definition of Done.
                  </div>
                </div>
              </div>
            </div>

            {/* Macierz Architektury i Standardów */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lewa kolumna: Moduły i Warstwy */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Architektura Warstwowa Aplikacji Android
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Warstwa UI & Prezentacji</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Jetpack Compose + Material 3</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Bezstanowe komponenty Composable, State Hoisting, unikanie niepotrzebnych rekompozycji. Konsumpcja stanu wyłącznie przez <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">collectAsStateWithLifecycle()</code>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Warstwa ViewModel & Stanu</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">MVVM / StateFlow</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Prywatny <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">_uiState: MutableStateFlow</code>, publiczny <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">uiState: StateFlow</code>. Jednokierunkowy przepływ danych (UDF), zdarzenia jednorazowe przez Channel / SharedFlow.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Warstwa Domenowa (Domain)</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">UseCases / Interactors</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Czysty Kotlin, brak zależności od Android SDK. Każdy przypadek użycia reprezentuje pojedynczą operację biznesową i zwraca <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">Result&lt;T&gt;</code> lub <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">Flow&lt;T&gt;</code>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Warstwa Danych & Offline-First</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">Room + DataStore (SSOT)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Baza Room jako Single Source of Truth. Operacje sieciowe zapisują do lokalnego cache. Wszelkie I/O zabezpieczone na poziomie Repository za pomocą <code className="text-teal-300 bg-slate-900 px-1 py-0.5 rounded">Dispatchers.IO</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Prawa kolumna: Podsumowanie audytu środowiska */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    Weryfikacja Środowiska Wykonawczego
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400">Środowisko bazowe:</span>
                      <span className="font-mono text-slate-200">Google AI Studio Node 22 / Cloud Run</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400">Status kompilacji web app:</span>
                      <span className="font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktywna (Port 3000)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400">Pliki dokumentacji utworzone:</span>
                      <span className="font-mono text-emerald-400">AGENTS.md, DoD, ROADMAP, TASKS, .codex</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400">Rekomendowane wersje Android:</span>
                      <span className="font-mono text-slate-200">Kotlin 2.0.21, Compose 1.7+, Room 2.6.1</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Plan Działania Architekta:
                    </h4>
                    <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
                      <li>Utrzymanie pełnej dokumentacji i weryfikacji DoD dla każdego etapu.</li>
                      <li>Dostarczenie referencyjnych implementacji dla kluczowych modułów (Room, ViewModel, DataStore).</li>
                      <li>Zapewnienie interaktywnego narzędzia do audytu kodu i eliminacji antywzorców.</li>
                      <li>Przejście do realizacji zadań o najwyższym priorytecie (P0) z TASKS.md.</li>
                    </ol>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Ostatnia weryfikacja: dzisiaj</span>
                  <button
                    onClick={() => setActiveTab('inspector')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    Przejdź do Inspektora Kodu <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 2: DORADCA & ANALIZATOR KODU */}
        {activeTab === 'inspector' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code2 className="w-6 h-6 text-emerald-400" />
                  Interaktywny Doradca & Analizator Kodu Android
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Wklej swój kod Kotlin / Compose lub wybierz gotowy przypadek, aby sprawdzić wycieki pamięci, błędy wątkowości i zgodność z architekturą Google.
                </p>
              </div>

              {/* Wybór presetu */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-slate-400 whitespace-nowrap">Przypadek testowy:</span>
                <select
                  value={selectedPreset}
                  onChange={(e) => {
                    const preset = CODE_PRESETS.find(p => p.id === e.target.value);
                    if (preset) {
                      setSelectedPreset(preset.id);
                      setCustomCode(preset.code);
                    }
                  }}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-full md:w-auto"
                >
                  {CODE_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dwu-kolumnowy edytor i audyt w czasie rzeczywistym */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolumna kodu (7/12) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="font-mono text-slate-400">AndroidCodeSnippet.kt</span>
                    </div>

                    <button
                      onClick={() => handleCopy(customCode)}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Kopiuj kod"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copied ? 'Skopiowano' : 'Kopiuj'}</span>
                    </button>
                  </div>

                  <textarea
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    rows={18}
                    className="w-full bg-slate-950/90 text-slate-200 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed selection:bg-emerald-500/30"
                    placeholder="Wklej kod Kotlin / Jetpack Compose tutaj..."
                    spellCheck={false}
                  />

                  <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Linijek kodu: {customCode.split('\n').length}</span>
                    <button
                      onClick={() => setCustomCode('')}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Wyczyść pole
                    </button>
                  </div>
                </div>
              </div>

              {/* Kolumna audytu i rekomendacji (5/12) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Karta Oceny Architektonicznej */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-slate-400">Ocena Architekta</div>
                      <div className="text-xl font-bold text-white mt-0.5">{codeAnalysis.grade}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Wskaźnik Jakości</div>
                      <div className={`text-2xl font-mono font-bold ${
                        codeAnalysis.score >= 80 ? 'text-emerald-400' : codeAnalysis.score >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {codeAnalysis.score}/100
                      </div>
                    </div>
                  </div>

                  {/* Pasek postępu oceny */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                    <div
                      className={`h-full transition-all duration-500 ${
                        codeAnalysis.score >= 80 ? 'bg-emerald-500' : codeAnalysis.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${codeAnalysis.score}%` }}
                    />
                  </div>

                  {/* Lista wykrytych problemów i dobrych praktyk */}
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {codeAnalysis.findings.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                        Wklej kod powyżej, aby uruchomić audyt reguł architektonicznych.
                      </div>
                    ) : (
                      codeAnalysis.findings.map((f, i) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                            f.type === 'error'
                              ? 'bg-red-950/20 border-red-900/50 text-red-200'
                              : f.type === 'warning'
                              ? 'bg-amber-950/20 border-amber-900/50 text-amber-200'
                              : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-semibold">
                            {f.type === 'error' && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                            {f.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                            {f.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                            <span>{f.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-normal pl-6">
                            {f.description}
                          </p>
                          <div className="text-[11px] font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-slate-200 mt-2">
                            <span className="text-emerald-400 font-bold block mb-0.5">Rekomendacja architekta:</span>
                            {f.fix}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 3: REJESTR ZADAŃ (TASKS) */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ListTodo className="w-6 h-6 text-emerald-400" />
                  Rejestr Zadań i Postęp Wdrożenia (TASKS.md)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Hierarchia priorytetów P0 (blokujące), P1 (kluczowe), P2 (rozszerzone) zgodnie z wytycznymi projektu.
                </p>
              </div>

              {/* Filtry zadań */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
                  <span className="text-slate-500 px-2">Priorytet:</span>
                  {(['ALL', 'P0', 'P1', 'P2'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setTaskFilter(p)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        taskFilter === p ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
                  <span className="text-slate-500 px-2">Status:</span>
                  {(['ALL', 'DONE', 'IN_PROGRESS', 'TODO'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setTaskStatusFilter(s)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        taskStatusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s === 'ALL' ? 'Wszystkie' : s === 'DONE' ? 'Ukończone' : s === 'IN_PROGRESS' ? 'W toku' : 'Do zrobienia'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabela zadań */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-24">ID</th>
                      <th className="py-3 px-4 w-28">Priorytet</th>
                      <th className="py-3 px-4 w-32">Moduł</th>
                      <th className="py-3 px-4">Tytuł Zadania & Zakres</th>
                      <th className="py-3 px-4 w-36">Status</th>
                      <th className="py-3 px-4 w-28 text-center">DoD Zweryfikowane</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{task.id}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            task.priority === 'P0'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : task.priority === 'P1'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-300">{task.category}</td>
                        <td className="py-3.5 px-4 text-slate-200">
                          <div className="font-semibold">{task.title}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              task.status === 'DONE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                            title="Kliknij, aby zmienić status"
                          >
                            {task.status === 'DONE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {task.status === 'IN_PROGRESS' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                            {task.status === 'TODO' && <AlertTriangle className="w-3.5 h-3.5" />}
                            <span>{task.status === 'DONE' ? 'Ukończone' : task.status === 'IN_PROGRESS' ? 'W toku' : 'Do zrobienia'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {task.verified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                              <CheckCircle2 className="w-4 h-4" /> Tak
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                              <XCircle className="w-4 h-4" /> Oczekuje
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 4: DEFINITION OF DONE */}
        {activeTab === 'dod' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                Definition of Done (DoD) - Rygor Jakościowy
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kryteria akceptacji przed uznaniem jakiejkolwiek funkcjonalności Android za ukończoną i gotową do wydania.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> 1. Architektura & Zarządzanie Stanem
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Unidirectional Data Flow (UDF):</strong> Zdarzenia płyną w górę do ViewModelu, niezmienny stan płynie w dół do Compose.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>collectAsStateWithLifecycle:</strong> Obowiązkowe użycie przy subskrybowaniu StateFlow w ekranach Composable.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Enkapsulacja:</strong> Brak publicznych <code className="text-slate-100 bg-slate-950 px-1 py-0.5 rounded">MutableStateFlow</code> w ViewModelach.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                  <Database className="w-4 h-4" /> 2. Dane, Baza Room & Offline-First
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>Single Source of Truth (SSOT):</strong> UI czyta wyłącznie z bazy danych Room; sieć aktualizuje cache lokalny.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>Bezpieczne Dispatchery:</strong> Wszelkie operacje bazodanowe i sieciowe na <code className="text-slate-100 bg-slate-950 px-1 py-0.5 rounded">Dispatchers.IO</code>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>DataStore Preferences:</strong> Zastąpienie przestarzałych SharedPreferences bezpiecznym, asynchronicznym DataStore.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> 3. UI, Material 3 & Rekompozycja
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Stabilne klucze list:</strong> Jawny <code className="text-slate-100 bg-slate-950 px-1 py-0.5 rounded">key</code> w LazyColumn dla optymalizacji recomposition.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Material 3 & Dark Theme:</strong> Pełne wsparcie dla ColorScheme Material You i dynamicznego motywu Android 12+.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Obsługa stanów:</strong> Każdy ekran implementuje stany: Loading, Success, Error oraz Empty z przyciskiem Retry.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 4. Testy & Bramki Jakości
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Turbine & Coroutines Test:</strong> Testy jednostkowe ViewModeli i strumieni StateFlow z wirtualnym czasem.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Testy DAO Room:</strong> Weryfikacja zapytań SQL w pamięciowej bazie <code className="text-slate-100 bg-slate-950 px-1 py-0.5 rounded">inMemoryDatabaseBuilder</code>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Brak błędów Lint & Detekt:</strong> Czysty raport statycznej analizy kodu przed przygotowaniem paczki release.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 5: DOKUMENTACJA ARCHITEKTURY */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-400" />
                Katalog Dokumentacji Inżynieryjnej
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Pliki specyfikacji utworzone i utrzymywane w repozytorium projektu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold mb-1">
                    <FileText className="w-4 h-4" /> AGENTS.md
                  </div>
                  <p className="text-xs text-slate-400">
                    Instrukcje operacyjne dla zespołu i agentów: rola Senior Architekta, standardy Kotlin 2.0 i zakaz atrap kodu.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-mono">
                  Status: Aktywny w repo
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm font-semibold mb-1">
                    <FileText className="w-4 h-4" /> .codex/config.toml
                  </div>
                  <p className="text-xs text-slate-400">
                    Konfiguracja bramek jakościowych, reguł Detekt/ktlint oraz komend budowania Gradle.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-indigo-400 font-mono">
                  Status: Skonfigurowany
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-semibold mb-1">
                    <FileText className="w-4 h-4" /> ROADMAP.md
                  </div>
                  <p className="text-xs text-slate-400">
                    Fazy wdrożenia: Audyt wstępny, Room Offline-First, Warstwa domenowa, Compose M3, Stabilizacja i Wydanie.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-mono">
                  Status: 5 Faz zdefiniowanych
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-teal-400 font-mono text-sm font-semibold mb-1">
                    <FileText className="w-4 h-4" /> DEFINITION_OF_DONE.md
                  </div>
                  <p className="text-xs text-slate-400">
                    Kryteria akceptacji: UDF, Dispatchers.IO, Room SSOT, testy jednostkowe z Turbine i brak memory leaks.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-teal-400 font-mono">
                  Status: Wiążący standard
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-400 font-mono text-sm font-semibold mb-1">
                    <FileText className="w-4 h-4" /> PROGRESS.md
                  </div>
                  <p className="text-xs text-slate-400">
                    Bieżąca inwentaryzacja postępów, ocena dojrzałości komponentów i rejestr ryzyk projektowych.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-blue-400 font-mono">
                  Status: Zsynchronizowany
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 font-mono text-sm font-semibold mb-1">
                    <FileText className="w-4 h-4" /> CHANGELOG.md
                  </div>
                  <p className="text-xs text-slate-400">
                    Rejestr decyzji architektonicznych (ADR) oraz wykaz zmian wprowadzonych w poszczególnych wersjach.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-purple-400 font-mono">
                  Status: Wersja 0.1.0 zarejestrowana
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Stopka */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Android Architecture & Advisory Studio • Google AI Studio • Zgodne z Google Modern Android Architecture (Kotlin 2.0, Jetpack Compose, Material 3, Room, DataStore)
        </p>
      </footer>
    </div>
  );
}
