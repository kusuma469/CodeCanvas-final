import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from 'sonner';
import { ConvexClientProvider } from '@/providers/convex-client-provider'; // Import ConvexProvider
import { ModalProvider } from '@/providers/modal-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
      
        <html lang="en">
          <body>
            <header>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                
                <ConvexClientProvider>
                  <Toaster />
                  <ModalProvider />
                  {children}
                </ConvexClientProvider>
                
              </SignedIn>
            </header>
          </body>
        </html>
      
    
  );
}
