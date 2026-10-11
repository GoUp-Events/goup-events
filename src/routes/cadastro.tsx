import { createFileRoute } from '@tanstack/react-router';
import { metadata } from '@/lib/format';
import { AuthPage } from '@/components/goup/account';
export const Route=createFileRoute('/cadastro')({head:()=>metadata('Crie sua conta','Faça parte do GoUp e descubra eventos em Blumenau e região.'),component:()=> <AuthPage register/>});
