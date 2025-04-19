
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { useKaraoke } from "@/context/KaraokeContext";

interface ConfigForm {
  usbPath: string;
  karaokePath: string;
}

export const ConfigButton = () => {
  const form = useForm<ConfigForm>({
    defaultValues: {
      usbPath: "/storage/usb",
      karaokePath: "karaoke"
    }
  });

  const onSubmit = (data: ConfigForm) => {
    console.log("Configurações salvas:", data);
    // Aqui você pode implementar a lógica para salvar as configurações
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configurações</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="usbPath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caminho do USB</FormLabel>
                  <FormControl>
                    <Input placeholder="/storage/usb" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="karaokePath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pasta do Karaoke</FormLabel>
                  <FormControl>
                    <Input placeholder="karaoke" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              Salvar
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
