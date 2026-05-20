// Credential Management API — not yet in TypeScript's lib.dom.d.ts

interface PasswordCredentialData {
  id: string
  password: string
  name?: string
  iconURL?: string
}

declare class PasswordCredential implements Credential {
  readonly id: string
  readonly type: string
  readonly password: string
  readonly name: string
  readonly iconURL: string
  constructor(data: PasswordCredentialData)
  constructor(form: HTMLFormElement)
}

interface CredentialRequestOptions {
  password?: boolean
}
