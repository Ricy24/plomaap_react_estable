export const servicesDatabase = {
  plomeria: {
    id: 'plomeria',
    icon: 'fa-faucet-drip',
    defaultOption: 0,
    options: [
      {
        name: 'Fugas',
        priceLabel: 'Desde $45k',
        icon: 'fa-droplet',
        title: 'Fugas de Agua',
        subtitle: 'Detección y Reparación',
        time: '1-2 h',
        warranty: '30 Días',
        techs: '45+',
        basePrice: '$45.000',
        image:
          'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Destape',
        priceLabel: 'Desde $60k',
        icon: 'fa-sink',
        title: 'Destape Cañerías',
        subtitle: 'Mantenimiento Correctivo',
        time: '2-3 h',
        warranty: '15 Días',
        techs: '30+',
        basePrice: '$60.000',
        image:
          'https://images.unsplash.com/photo-1607472586893-edb57cbca132?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Grifería',
        priceLabel: 'Desde $35k',
        icon: 'fa-shower',
        title: 'Instalación Grifería',
        subtitle: 'Renovación de Baños',
        time: '1 h',
        warranty: '60 Días',
        techs: '50+',
        basePrice: '$35.000',
        image:
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  electricidad: {
    id: 'electricidad',
    icon: 'fa-bolt',
    defaultOption: 0,
    options: [
      {
        name: 'Cortos',
        priceLabel: 'Desde $50k',
        icon: 'fa-plug-circle-exclamation',
        title: 'Cortocircuitos',
        subtitle: 'Emergencia Eléctrica',
        time: '1-3 h',
        warranty: '30 Días',
        techs: '25+',
        basePrice: '$50.000',
        image:
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Cableado',
        priceLabel: 'Desde $120k',
        icon: 'fa-network-wired',
        title: 'Nuevo Cableado',
        subtitle: 'Instalación General',
        time: '5-8 h',
        warranty: '1 Año',
        techs: '15+',
        basePrice: '$120.000',
        image:
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  pintura: {
    id: 'pintura',
    icon: 'fa-brush',
    defaultOption: 0,
    options: [
      {
        name: 'Interiores',
        priceLabel: 'Por m²',
        icon: 'fa-fill-drip',
        title: 'Pintura Interior',
        subtitle: 'Acabados y Estuco Profesional',
        time: '1-2 Días',
        warranty: '6 Meses',
        techs: '40+',
        basePrice: 'Cotizar m²',
        image:
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
}

export function getServicesDatabase() {
  return servicesDatabase
}
