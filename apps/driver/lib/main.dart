import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:geolocator/geolocator.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // TUS CREDENCIALES DE SUPABASE (ya están puestas)
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
      title: 'Sistema Carrito GPS',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const LocationScreen(),
    );
  }
}

class LocationScreen extends StatefulWidget {
  const LocationScreen({super.key});

  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  final supabase = Supabase.instance.client;
  String _status = 'Presiona el botón para enviar tu ubicación';
  bool _isLoading = false;

  Future<void> _enviarUbicacion() async {
    setState(() {
      _isLoading = true;
      _status = 'Obteniendo ubicación...';
    });

    try {
      // Verificar permisos
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

      // Obtener ubicación actual
      setState(() {
        _status = 'GPS activado, obteniendo coordenadas...';
      });
      
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high
      );

      setState(() {
        _status = 'Enviando a base de datos...';
      });

      // Enviar a Supabase
      await supabase.from('locations').insert({
        'latitude': position.latitude,
        'longitude': position.longitude,
        'location_name': 'Mi ubicación actual',
        'timestamp': DateTime.now().toIso8601String(),
      });

      setState(() {
        _status = '✅ Ubicación enviada exitosamente!\n'
                 'Lat: ${position.latitude.toStringAsFixed(6)}\n'
                 'Lng: ${position.longitude.toStringAsFixed(6)}';
      });
    } catch (e) {
      print('Error detallado: $e');
      setState(() {
        _status = '❌ Error: $e\n'
                'Intenta permitir ubicación en el navegador\n'
                'o prueba desde tu celular';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('Sistema Automático Carrito'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.location_on,
                size: 80,
                color: _isLoading ? Colors.orange : Colors.blue,
              ),
              const SizedBox(height: 30),
              
              // Botón grande y bonito
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
              
              // Estado/Resultado
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
            ],
          ),
        ),
      ),
    );
  }
}