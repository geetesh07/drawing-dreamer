
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Code, Server } from "lucide-react";

const DeploymentGuide = () => {
  return (
    <div className="bg-card border rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Server className="mr-2 h-5 w-5 text-primary" />
        Deploying to cPanel
      </h2>
      
      <div className="text-muted-foreground mb-6">
        Follow these steps to deploy your Conveyor Design application to a cPanel hosting environment.
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="step1">
          <AccordionTrigger className="text-lg font-medium">
            1. Build Your Application
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <p>First, create a production build of your application:</p>
            
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              npm run build
            </div>
            
            <p>This will create a <code>dist</code> folder containing your production-ready files.</p>
            
            <div className="flex items-center text-sm text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Make sure all your dependencies are installed and the build completes without errors.
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step2">
          <AccordionTrigger className="text-lg font-medium">
            2. Create a .htaccess File
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <p>Create a file named <code>.htaccess</code> in the root of your <code>dist</code> folder with the following content:</p>
            
            <div className="bg-muted p-3 rounded-md font-mono text-sm whitespace-pre-wrap">
              {`<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`}
            </div>
            
            <p>This will handle client-side routing in your React application.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step3">
          <AccordionTrigger className="text-lg font-medium">
            3. Upload Files to cPanel
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <p>Log in to your cPanel account and follow these steps:</p>
            
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the File Manager in cPanel.</li>
              <li>Navigate to your website's public directory (usually <code>public_html</code>).</li>
              <li>You may want to create a subdirectory for your app or upload to the root.</li>
              <li>Upload all files from your local <code>dist</code> folder.</li>
            </ol>
            
            <div className="flex items-center text-sm text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Make sure to upload the <code>.htaccess</code> file as well. It may be hidden in your file explorer.
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step4">
          <AccordionTrigger className="text-lg font-medium">
            4. Set Proper Permissions
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <p>Set the correct file permissions:</p>
            
            <ul className="list-disc list-inside space-y-2">
              <li>Directories: <code>755</code> (drwxr-xr-x)</li>
              <li>Files: <code>644</code> (rw-r--r--)</li>
            </ul>
            
            <p>In cPanel File Manager, you can right-click on files or directories and select "Change Permissions".</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step5">
          <AccordionTrigger className="text-lg font-medium">
            5. Test Your Deployment
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <p>Visit your website URL to make sure everything is working correctly.</p>
            
            <p>If you deployed to a subdirectory, the URL would be:</p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              https://yourdomain.com/subdirectory/
            </div>
            
            <div className="flex items-center text-sm text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
              <AlertTriangle className="mr-2 h-4 w-4" />
              If you encounter issues with routes not working, make sure your <code>.htaccess</code> file is properly uploaded and configured.
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="step6">
          <AccordionTrigger className="text-lg font-medium">
            6. Troubleshooting Common Issues
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <h4 className="font-medium">404 Errors When Refreshing Routes</h4>
            <p>If you get 404 errors when refreshing the page on routes like <code>/pulley</code> or <code>/idler</code>:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Verify your <code>.htaccess</code> file is properly uploaded.</li>
              <li>Make sure mod_rewrite is enabled on your hosting.</li>
              <li>Contact your hosting provider to confirm .htaccess files are allowed.</li>
            </ul>
            
            <h4 className="font-medium mt-4">Blank Page or Loading Issues</h4>
            <p>If you see a blank page:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check browser console for errors.</li>
              <li>Verify all script and asset paths are correct.</li>
              <li>Check if your hosting supports ES6 features (some may require additional polyfills).</li>
            </ul>
            
            <div className="flex items-center text-sm bg-muted p-3 rounded-md mt-2">
              <Code className="mr-2 h-4 w-4" />
              If nothing else works, try deploying to a subdomain with its own document root to avoid conflicts with existing websites.
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-6 pt-4 border-t">
        <h3 className="font-medium mb-2">Need More Help?</h3>
        <p className="text-muted-foreground mb-4">
          For more advanced deployment options or custom configurations, check the official documentation:
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild className="flex-1 sm:flex-initial">
            <a href="https://vitejs.dev/guide/static-deploy.html" target="_blank" rel="noopener noreferrer">
              Vite Deployment Guide
            </a>
          </Button>
          <Button variant="outline" asChild className="flex-1 sm:flex-initial">
            <a href="https://reactrouter.com/en/main/start/overview" target="_blank" rel="noopener noreferrer">
              React Router Docs
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentGuide;
