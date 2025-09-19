import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

final uuid = Uuid();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await dotenv.load(fileName: ".env");

  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!,
    anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  );
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sistema de recolección',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const AuthChecker(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AuthChecker extends StatefulWidget {
  const AuthChecker({super.key});

  @override
  State<AuthChecker> createState() => _AuthCheckerState();
}

class _AuthCheckerState extends State<AuthChecker> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('user_id');
    final userEmail = prefs.getString('user_email');
    final userRole = prefs.getString('user_role');
    
    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      if (userId != null && userEmail != null) {
        final userData = {
          'id': userId,
          'email': userEmail,
          'username': prefs.getString('user_name') ?? 'Conductor',
          'appRole': userRole ?? 'driver',
          'display_username': prefs.getString('user_name') ?? userEmail.split('@')[0],
        };
        
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => LocationScreen(userData: userData),
          ),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.local_shipping, size: 80, color: Colors.blue),
            SizedBox(height: 20),
            CircularProgressIndicator(),
            SizedBox(height: 20),
            Text('Verificando sesión...'),
          ],
        ),
      ),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _emailController.text = 'driver1@example.com';
  }

  Future<void> _login() async {
    if (_emailController.text.isEmpty) {
      setState(() {
        _errorMessage = 'Por favor ingresa tu email';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final response = await Supabase.instance.client
          .from('user')
          .select('*')
          .eq('email', _emailController.text.trim())
          .maybeSingle();
      
      if (response != null) {
        final appRole = response['appRole'];
        
        if (appRole != 'driver') {
          throw Exception('Solo conductores pueden acceder. Tu rol es: $appRole');
        }
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_id', response['id']);
        await prefs.setString('user_email', response['email']);
        await prefs.setString('user_name', response['display_username'] ?? response['username'] ?? 'Conductor');
        await prefs.setString('user_role', appRole);
        await prefs.setBool('is_logged_in', true);
        
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => LocationScreen(userData: response),
            ),
          );
        }
      } else {
        setState(() {
          _errorMessage = 'Usuario no encontrado';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: ${e.toString()}';
      });
      print('Error detallado: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.local_shipping,
                  size: 80,
                  color: Colors.blue,
                ),
                const SizedBox(height: 20),
                
                const Text(
                  'Sistema de Recolección',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Text(
                  'Acceso para Conductores',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 40),
                
                TextField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    labelText: 'Email',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: const Icon(Icons.email),
                    filled: true,
                    fillColor: Colors.grey[50],
                  ),
                  keyboardType: TextInputType.emailAddress,
                  enabled: !_isLoading,
                ),
                const SizedBox(height: 16),
                
                TextField(
                  controller: _passwordController,
                  decoration: InputDecoration(
                    labelText: 'Contraseña (opcional)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: const Icon(Icons.lock),
                    filled: true,
                    fillColor: Colors.grey[50],
                    hintText: 'Dejar vacío - sin validación',
                  ),
                  obscureText: true,
                  enabled: !_isLoading,
                  onSubmitted: (_) => _login(),
                ),
                const SizedBox(height: 20),
                
                if (_errorMessage.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _errorMessage,
                      style: TextStyle(color: Colors.red[700]),
                      textAlign: TextAlign.center,
                    ),
                  ),
                const SizedBox(height: 20),
                
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _login,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text(
                            'Iniciar Sesión',
                            style: TextStyle(fontSize: 16),
                          ),
                  ),
                ),
                
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '📝 Conductores disponibles:\n\n'
                    '• driver1@example.com\n'
                    '• driver@example.com\n\n'
                    'Solo ingresa el email y presiona Iniciar',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.blue[900],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}

class LocationScreen extends StatefulWidget {
  final Map<String, dynamic> userData;
  const LocationScreen({super.key, required this.userData});

  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  final supabase = Supabase.instance.client;
  String _status = 'Presiona el botón para enviar tu ubicación';
  bool _isLoading = false;
  Position? _lastPosition;
  int _locationsSent = 0;
  Timer? _autoTimer;
  bool _autoTracking = false;
  String? _truckId;

  @override
  void initState() {
    super.initState();
    _checkOrCreateTruck();
  }

  Future<void> _checkOrCreateTruck() async {
  try {
    // Buscar si existe un truck para este conductor
    final existingTruck = await supabase
        .from('truck')
        .select('id')
        .eq('name', 'Truck-${widget.userData['id']}')
        .maybeSingle();

    if (existingTruck != null) {
      // Usa un truck_id fijo para pruebas
      _truckId = 'e1r1l57voricugbvaqe8nsyr8';
      print('✅ Truck encontrado. Usando truck_id fijo: $_truckId');
    } else {
      // Crear un truck para este conductor
      final newTruck = await supabase
          .from('truck')
          .insert({
            'id': DateTime.now().microsecondsSinceEpoch.toString(), // PK única
            'name': 'Truck-${widget.userData['username'] ?? widget.userData['email'].split('@')[0]}',
            'license_plate': 'AUTO-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
            'is_active': true,
            'created_at': DateTime.now().toIso8601String(),
          })
          .select()
          .single();

      _truckId = newTruck['id'];
      print('🚛 Nuevo truck creado con ID: $_truckId');
    }
  } catch (e) {
    print('❌ Error con truck: $e');
    // Si falla, usar el ID del usuario como fallback
    _truckId = widget.userData['id'];
    print('⚠️ Fallback: usando user_id como truck_id: $_truckId');
  }
}

  void _toggleAutoTracking() {
    if (_autoTracking) {
      _autoTimer?.cancel();
      setState(() {
        _autoTracking = false;
        _status = '⏸️ Tracking automático detenido';
      });
    } else {
      setState(() {
        _autoTracking = true;
        _status = '▶️ Tracking automático activado (cada 30 seg)';
      });
      
      // Enviar ubicación inmediatamente
      _enviarUbicacion();
      
      // Luego cada 30 segundos
      _autoTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
        if (_autoTracking) {
          _enviarUbicacion();
        }
      });
    }
  }

  
  Future<void> _enviarUbicacion() async {
    setState(() {
      _isLoading = true;
      _status = 'Obteniendo ubicación...';
    });

    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _status = '❌ Permisos de ubicación denegados';
            _isLoading = false;
          });
          return;
        }
      }

      setState(() {
        _status = 'GPS activado, obteniendo coordenadas...';
      });

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _lastPosition = position;
        _status = 'Enviando a base de datos...';
      });

      final truckId = _truckId ?? widget.userData['id'];
      final now = DateTime.now().toIso8601String();

      // 1️⃣ Guardar en histórico
      await supabase.from('truck_location_history').insert({
        'id': uuid.v4(),
        'truck_id': truckId,
        'lat': position.latitude,
        'lng': position.longitude,
        'speed': position.speed,
        'heading': position.heading,
        // recorded_at se genera solo (default now())
      });

      // 2️⃣ Guardar o actualizar posición actual
      await supabase.from('truck_current_location').upsert({
        'truck_id': truckId,
        'lat': position.latitude,
        'lng': position.longitude,
        'speed': position.speed,
        'heading': position.heading,
        'updated_at': now,
      });

      setState(() {
        _locationsSent++;
        _status = '✅ Ubicación enviada exitosamente!\n'
            'Lat: ${position.latitude.toStringAsFixed(6)}\n'
            'Lng: ${position.longitude.toStringAsFixed(6)}';
      });

      if (_autoTracking) {
        setState(() {
          _status += '\n\n🔄 Modo automático activo';
        });
      }
    } catch (e) {
      print('Error detallado: $e');
      setState(() {
        _status = '❌ Error: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }








  Future<void> _viewHistory() async {
    try {
      final history = await supabase
          .from('truck_location')
          .select('*')
          .eq('truck_id', _truckId ?? widget.userData['id'])
          .order('timestamp', ascending: false)
          .limit(10);

      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Últimas 10 ubicaciones'),
            content: SizedBox(
              width: double.maxFinite,
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: history.length,
                itemBuilder: (context, index) {
                  final loc = history[index];
                  final timestamp = DateTime.parse(loc['timestamp']);
                  return ListTile(
                    dense: true,
                    title: Text('${loc['latitude'].toStringAsFixed(4)}, ${loc['longitude'].toStringAsFixed(4)}'),
                    subtitle: Text('${timestamp.day}/${timestamp.month} ${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}'),
                  );
                },
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cerrar'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      setState(() {
        _status = 'Error obteniendo historial: $e';
      });
    }
  }

  Future<void> _logout() async {
    _autoTimer?.cancel();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  void dispose() {
    _autoTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('Sistema Automático Carrito'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: _viewHistory,
            tooltip: 'Ver historial',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Cerrar Sesión'),
                  content: const Text('¿Estás seguro que deseas cerrar sesión?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancelar'),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _logout();
                      },
                      child: const Text('Cerrar Sesión'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Información del conductor
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  const Icon(Icons.person, size: 40, color: Colors.blue),
                  const SizedBox(height: 8),
                  Text(
                    'Conductor: ${widget.userData['display_username'] ?? widget.userData['username'] ?? widget.userData['email']}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Rol: ${widget.userData['appRole']}',
                    style: TextStyle(fontSize: 12, color: Colors.blue[700]),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.send, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        'Ubicaciones enviadas: $_locationsSent',
                        style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                  if (_truckId != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      'Truck ID: ${_truckId!.substring(0, 8)}...',
                      style: TextStyle(fontSize: 10, color: Colors.grey[500]),
                    ),
                  ],
                ],
              ),
            ),
            
            // Ícono principal
            Icon(
              Icons.location_on,
              size: 80,
              color: _isLoading 
                  ? Colors.orange 
                  : (_autoTracking ? Colors.green : Colors.blue),
            ),
            const SizedBox(height: 20),
            
            // Botón principal
            ElevatedButton(
              onPressed: _isLoading ? null : _enviarUbicacion,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 50,
                  vertical: 20,
                ),
                textStyle: const TextStyle(fontSize: 20),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('📍 Enviar Mi Ubicación'),
            ),
            
            const SizedBox(height: 15),
            
            // Botones secundarios
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                  onPressed: _isLoading ? null : _toggleAutoTracking,
                  icon: Icon(_autoTracking ? Icons.pause : Icons.play_arrow),
                  label: Text(_autoTracking ? 'Detener Auto' : 'Auto Track'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _autoTracking ? Colors.orange : Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // Estado
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                children: [
                  Text(
                    _status,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16),
                  ),
                  if (_autoTracking) ...[
                    const SizedBox(height: 10),
                    LinearProgressIndicator(
                      backgroundColor: Colors.grey[300],
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.green),
                    ),
                  ],
                ],
              ),
            ),
            
            // Última ubicación
            if (_lastPosition != null) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green[200]!),
                ),
                child: Column(
                  children: [
                    const Text(
                      '📊 Datos adicionales:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Column(
                          children: [
                            Icon(Icons.speed, size: 20, color: Colors.green[700]),
                            const SizedBox(height: 4),
                            Text(
                              '${(_lastPosition!.speed * 3.6).toStringAsFixed(1)} km/h',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                        Column(
                          children: [
                            Icon(Icons.gps_fixed, size: 20, color: Colors.green[700]),
                            const SizedBox(height: 4),
                            Text(
                              '±${_lastPosition!.accuracy.toStringAsFixed(1)}m',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                        Column(
                          children: [
                            Icon(Icons.access_time, size: 20, color: Colors.green[700]),
                            const SizedBox(height: 4),
                            Text(
                              DateTime.now().toString().substring(11, 19),
                              style: const TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
