import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust the path as necessary
import * as THREE from 'three';

@Component({
  selector: 'app-home',
  template: '<div id="globeContainer"></div>',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private globe!: THREE.Mesh;
  private dayTexture!: THREE.Texture;
  private nightTexture!: THREE.Texture;
  // Create a variable to hold the point light
  private globeLight!: THREE.PointLight;
  private animationFrameId: number = 0;
  // Create a variable to hold the stars' group
  private starsGroup!: THREE.Group;

  constructor(private authService: AuthService, private router: Router,private el: ElementRef) { }

  logout(): void {
    this.authService.logout(); // Call the logout method from AuthService
    this.router.navigate(['/login']); // Redirect to login page
  }

  ngOnInit(): void {
    this.initThree();
    this.loadTextures();
    // this.addGlobe();
    // this.animate();
  }
  
  ngAfterViewInit() {
    // Initialize the globe and renderer after the view is initialized
    // this.addGlobe();
    console.log('animate');
    setTimeout(() => {
      this.addStars(); // Call the addStars function to add stars to the scene
    
      this.animate();
    }, 2000);
    
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer.domElement.remove();
    this.renderer.dispose();
  }

  private initThree() {
    // Wait for the view to be initialized
    // const container = this.el.nativeElement.querySelector('#globeContainer');
    const container = this.el.nativeElement.querySelector('#globeContainer');

    if (!container) {
      // Container not found, handle this case gracefully
      return;
    }

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);


    // Add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5); // You can adjust the position as needed
    this.scene.add(directionalLight);
  }

  private loadTextures() {
    const loader = new THREE.TextureLoader();
    console.log('Loading day texture...');
    loader.load('assets/textures/day_texture.webp', (dayTexture) => {
      this.dayTexture = dayTexture;
      console.log('Day texture loaded successfully');
      // Load the night texture
      console.log('Loading night texture...');
      loader.load('assets/textures/night_texture.webp', (nightTexture) => {
        this.nightTexture = nightTexture;
        console.log('Night texture loaded successfully');
        // Once both textures are loaded, add the globe
        this.addGlobe();
      });
    });
  }
  private addStars() {
    // Create a group for the stars
    this.starsGroup = new THREE.Group();
    this.scene.add(this.starsGroup);
  
    // Create stars and add them to the group
    const starGeometry = new THREE.SphereGeometry(0.02, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 500; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      star.position.set(x, y, z);
      this.starsGroup.add(star);
    }
  
    // Apply a rotation animation to the stars' group
    this.animateStarsRotation();
  }
  // Create a function to generate random stars
  private createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.01 });

    const starsVertices = [];

    // Generate random star positions
    const numStars = 1000;
    for (let i = 0; i < numStars; i++) {
      const x = (Math.random() - 0.5) * 2000; // Adjust the values as needed
      const y = (Math.random() - 0.5) * 2000; // Adjust the values as needed
      const z = (Math.random() - 0.5) * 2000; // Adjust the values as needed

      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    
    return stars;
  }
  private addGlobe() {
    if (!this.scene) {
      console.error('Scene is not initialized.');
      return;
    }
    if(!this.dayTexture||!this.nightTexture){
      console.error('Texture is not initialized.');
      return;
    }
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    // const material = new THREE.MeshPhongMaterial({ map: this.dayTexture }); // Start with day texture
    const material = new THREE.MeshPhongMaterial({
      map: this.dayTexture, // Start with day texture
      emissive: 0x444444, // Color of emitted light
    });
    this.globe = new THREE.Mesh(geometry, material);
    
    // Create a point light inside the globe
    this.globeLight = new THREE.PointLight(0xffffff, 1); // Adjust intensity as needed
    this.globe.add(this.globeLight);
    this.globeLight.intensity = 1; // Full light intensity at night
    this.scene.add(this.globe);

    
    // // Add stars to the scene
    // const stars = this.createStars();
    // this.scene.add(stars);
  }

  private updateDayNightCycle() {
    // Calculate whether it's currently day or night based on the user's local time
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour < 18;
    if(!this.dayTexture||!this.nightTexture){
      console.error('Texture is not initialized in updateDayNightCycle.');
      return
    }
    // Apply the appropriate texture (day or night)
    if (isDaytime) {
    // if (true) {
      (this.globe.material as THREE.MeshPhongMaterial).map = this.dayTexture;
      (this.globe.material as THREE.MeshPhongMaterial).emissive.setHex(0x444444); // Daylight color 0x444444
    } else {
      (this.globe.material as THREE.MeshBasicMaterial).map = this.nightTexture;
      (this.globe.material as THREE.MeshPhongMaterial).emissive.setHex(0x000000); // Nightlight color
    }
    
    // Ensure the texture updates
    // this.globe.material.needsUpdate = true;
    (this.globe.material as THREE.MeshPhongMaterial).needsUpdate = true;

  }
  // Function to animate the rotation of stars
  private animateStarsRotation() {
    this.starsGroup.rotation.x += 0.0005; // Adjust the rotation speed as needed
    this.starsGroup.rotation.y += 0.0005;
  }
  
  private animate = () => {
    // Update the rotation of stars in the animate loop
    this.animateStarsRotation();
    this.updateDayNightCycle(); // Update textures based on time of day

    // Rotate the globe
    if (this.globe) {
      this.globe.rotation.y += 0.01; // You can adjust the rotation speed as needed
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
    // Check if renderer is defined before rendering
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Define formData for the contact form
  formData: { name: string, email: string, message: string } = {
    name: '',
    email: '',
    message: ''
  };
  onSubmit() {
    // Handle form submission here
    const { name, email, message } = this.formData;
    // You can send the form data to your backend or perform any other desired actions
    console.log('Form submitted with data:', name, email, message);
    // Clear the form fields after submission if needed
    this.formData.name = '';
    this.formData.email = '';
    this.formData.message = '';
  }
}
