import { createFileRoute } from '@tanstack/react-router';
import { metadata } from '@/lib/format';
import { PlansPage } from '@/components/goup/plans';
export const Route=createFileRoute('/planos')({head:()=>metadata('Planos Free e Premium','Explore as possibilidades dos planos GoUp Free e Premium. Mais descobertas e experiências.'),component:PlansPage});
