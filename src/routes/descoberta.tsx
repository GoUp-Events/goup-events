import { createFileRoute } from '@tanstack/react-router';
import { metadata } from '@/lib/format';
import { DiscoveryPage } from '@/components/goup/discovery';
export const Route=createFileRoute('/descoberta')({head:()=>metadata('Descoberta Mágica','Conte sua vontade e descubra eventos que combinam com você. Uma experiência GoUp Premium.'),component:DiscoveryPage});
