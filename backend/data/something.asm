```asm
section .data
    array db 1, 2, 3, 4, 5  ; Define our array
    length db 5             ; Length of the array

section .bss
    sum resb 1              ; Reserve a byte for the sum

section .text
    global _start

_start:
    ; Initialize
    xor rcx, rcx            ; Counter i = 0
    xor rax, rax            ; Sum = 0

.loop:
    ; Check if counter reached the length of the array
    cmp rcx, [length]
    jge .end_loop

    ; Add array[i] to sum
    add al, byte [array + rcx]

    ; Increment counter
    inc rcx
    jmp .loop

.end_loop:
    ; Store result in 'sum'
    mov [sum], al

    ; Exit program
    mov rax, 60         ; syscall: exit
    xor rdi, rdi        ; status: 0
    syscall
