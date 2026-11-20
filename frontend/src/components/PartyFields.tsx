import { FormField } from '@/components/FormField'
import { Input } from '@/components/ui/input'
import type { Party } from '@/types/models'

interface PartyFieldsProps<T extends Party> {
  idPrefix: string
  value: T
  onChange: (patch: Partial<T>) => void
}

const FIELDS: { key: keyof Party; label: string; type?: string; className?: string; required?: boolean }[] = [
  { key: 'name', label: 'Naziv', className: 'sm:col-span-2', required: true },
  { key: 'address', label: 'Adresa', className: 'sm:col-span-2' },
  { key: 'postalCode', label: 'Poštanski broj' },
  { key: 'city', label: 'Grad' },
  { key: 'country', label: 'Država' },
  { key: 'taxId', label: 'PIB' },
  { key: 'registrationNumber', label: 'Matični broj' },
  { key: 'vatNumber', label: 'PDV broj' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Telefon', type: 'tel' },
]

/** Name, address and registration fields shared by companies and clients. */
export const PartyFields = <T extends Party>({ idPrefix, value, onChange }: PartyFieldsProps<T>) => (
  <>
    {FIELDS.map((field) => {
      const id = `${idPrefix}-${field.key}`
      return (
        <FormField key={field.key} id={id} label={field.required ? `${field.label} *` : field.label} className={field.className}>
          <Input
            id={id}
            type={field.type ?? 'text'}
            required={field.required}
            value={value[field.key]}
            onChange={(e) => onChange({ [field.key]: e.target.value } as Partial<T>)}
          />
        </FormField>
      )
    })}
  </>
)
