import { ImagePlus, Loader2, Stamp, Trash2, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCompanyImages } from '@/hooks/useCompanies'
import { getApiErrorMessage } from '@/services/api'
import type { Company } from '@/types/models'

const MAX_SIZE = 2 * 1024 * 1024
const MAX_STAMPS = 4
const ACCEPT = 'image/png,image/jpeg'

/** Client-side check so the user gets instant feedback; the server validates again. */
const validateImage = (file: File): string | null => {
  if (!['image/png', 'image/jpeg'].includes(file.type)) return 'Dozvoljene su samo PNG i JPG slike'
  if (file.size > MAX_SIZE) return 'Slika je prevelika (najviše 2 MB)'
  return null
}

interface FileButtonProps {
  onFile: (file: File) => void
  pending: boolean
  children: ReactNode
  className?: string
}

/** Button that opens a file picker and passes a validated PNG/JPG to `onFile`. */
const FileButton = ({ onFile, pending, children, className }: FileButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const error = validateImage(file)
    if (error) toast.error(error)
    else onFile(file)
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={onChange} />
      <Button variant="outline" className={className} disabled={pending} onClick={() => inputRef.current?.click()}>
        {pending ? <Loader2 className="animate-spin" /> : <Upload />}
        {children}
      </Button>
    </>
  )
}

export const CompanyImages = ({ company }: { company: Company }) => {
  const { uploadLogo, deleteLogo, addStamp, deleteStamp } = useCompanyImages(company._id)
  const [stampName, setStampName] = useState('')

  const notify = (message: string) => ({
    onSuccess: () => toast.success(message),
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  })

  const onLogo = (file: File) => uploadLogo.mutate(file, notify('Logo je sačuvan'))
  const onStamp = (file: File) =>
    addStamp.mutate({ file, name: stampName.trim() }, { ...notify('Pečat je dodat'), onSettled: () => setStampName('') })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Prikazuje se u zaglavlju fakture. PNG ili JPG, najviše 2 MB.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-36 items-center justify-center rounded-lg border bg-muted/40 p-4">
            {company.logo ? (
              <img src={company.logo.url} alt="Logo firme" className="max-h-full max-w-full object-contain" />
            ) : (
              <ImagePlus className="size-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex gap-2">
            <FileButton onFile={onLogo} pending={uploadLogo.isPending}>
              {company.logo ? 'Promijeni logo' : 'Dodaj logo'}
            </FileButton>
            {company.logo && (
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" disabled={deleteLogo.isPending}>
                    <Trash2 />
                    Ukloni
                  </Button>
                }
                title="Ukloniti logo?"
                description="Logo više neće biti prikazan na fakturama."
                confirmLabel="Ukloni"
                onConfirm={() => deleteLogo.mutate(undefined, notify('Logo je uklonjen'))}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pečati</CardTitle>
          <CardDescription>
            Prikazuju se na dnu fakture. Najbolje PNG sa providnom pozadinom. Najviše {MAX_STAMPS} pečata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company.stamps.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {company.stamps.map((stamp) => (
                <div key={stamp._id} className="group relative rounded-lg border p-2">
                  <div className="flex h-24 items-center justify-center">
                    <img src={stamp.url} alt={stamp.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <p className="mt-1 truncate text-center text-xs text-muted-foreground">{stamp.name}</p>
                  <ConfirmDialog
                    trigger={
                      <Button
                        size="icon-xs"
                        variant="destructive"
                        className="absolute top-1 right-1"
                        aria-label={`Obriši ${stamp.name}`}
                      >
                        <Trash2 />
                      </Button>
                    }
                    title="Obrisati pečat?"
                    description={`Pečat "${stamp.name}" više neće biti na novim fakturama.`}
                    onConfirm={() => deleteStamp.mutate(stamp._id, notify('Pečat je obrisan'))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm text-muted-foreground">
              <Stamp className="size-5" />
              Još nema pečata
            </div>
          )}

          {company.stamps.length < MAX_STAMPS && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Naziv pečata (opciono)"
                value={stampName}
                maxLength={100}
                onChange={(e) => setStampName(e.target.value)}
              />
              <FileButton onFile={onStamp} pending={addStamp.isPending} className="shrink-0">
                Dodaj pečat
              </FileButton>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
