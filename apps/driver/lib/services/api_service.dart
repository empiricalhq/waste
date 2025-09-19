import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://hqvxqwakmxdhtkgsuggt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxdnhxd2FrbXhkaHRrZ3N1Z2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODY1ODIsImV4cCI6MjA3Mjc2MjU4Mn0.jx1naBei09H6CTITZjPvqwfqxhc8sPfTSeTXGEB91ew',
  );
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sistema de Recolección',
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
    
    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      if (userId != null && userEmail != null) {
        final userData = {
          'id': userId,
          'email': userEmail,
          'username': prefs.getString('user_name') ?? 'Conductor',
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
      // CORREGIDO: Especificar el esquema 'public'
      final supabase = Supabase.instance.client;
      
      // Primero verificar que exista la tabla user
      final response = await supabase
          .from('user')  // Supabase automáticamente usa el esquema public
          .select('*')
          .eq('email', _emailController.text.trim())
          .maybeSingle();
      
      if (response != null) {
        // Verificar el rol - la columna es 'appRole' según tu BD
        final appRole = response['appRole'];
        
        // Verificar que sea driver
        if (appRole != 'driver') {
          throw Exception('Solo conductores pueden acceder. Tu rol es: $appRole');
        }
        
        // Guardar datos del usuario
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_id', response['id']);
        await prefs.setString('user_email', response['email'] ?? _emailController.text);
        await prefs.setString('user_name', response['username'] ?? response['display_username'] ?? 'Conductor');
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
                    hintText: 'Dejar vacío - no hay passwords',
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
                Text(
                  'Emails disponibles:\ndriver1@example.com\ndriver@example.com',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
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
        desiredAccuracy: LocationAccuracy.high
      );

      setState(() {
        _lastPosition = position;
        _status = 'Enviando a base de datos...';
      });

      await supabase.from('truck_location').insert({
        'truck_id': widget.userData['id'], // Usando el ID del usuario como truck_id temporalmente
        'latitude': position.latitude,
        'longitude': position.longitude,
        'timestamp': DateTime.now().toIso8601String(),
        // Agregar otros campos si la tabla los requiere
      });

      setState(() {
        _status = '✅ Ubicación enviada exitosamente!\n'
                 'Lat: ${position.latitude.toStringAsFixed(6)}\n'
                 'Lng: ${position.longitude.toStringAsFixed(6)}';
      });
    } catch (e) {
      print('Error detallado: $e');
      setState(() {
        _status = '❌ Error: ${e.toString()}\n'
                'Verifica que existe la tabla en Supabase';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _logout() async {
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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('Sistema Automático Carrito'),
        actions: [
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
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.only(bottom: 30),
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
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              
              Icon(
                Icons.location_on,
                size: 80,
                color: _isLoading ? Colors.orange : Colors.blue,
              ),
              const SizedBox(height: 30),
              
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
              
              const SizedBox(height: 40),
              
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _status,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 16),
                ),
              ),
              
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
                        'Última ubicación enviada:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text('Velocidad: ${(_lastPosition!.speed * 3.6).toStringAsFixed(1)} km/h'),
                      Text('Precisión: ${_lastPosition!.accuracy.toStringAsFixed(1)} metros'),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}