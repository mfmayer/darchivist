package arc

import (
	"fmt"
	"os"
	"path"

	"golang.org/x/text/message"
)

type TranslateError struct {
	format string
	a      []interface{}
}

func (ta *TranslateError) Error() string {
	return ta.Translate(nil)
}

func (ta *TranslateError) Translate(printer *message.Printer) string {
	if printer != nil {
		return printer.Sprintf(ta.format, ta.a...)
	}
	return fmt.Sprintf(ta.format, ta.a...)
}

func TranslateErrorf(format string, a ...interface{}) error {
	ta := &TranslateError{
		format: format,
		a:      a,
	}
	return ta
}

type FileActionError struct {
	FilePaths []string
	Err       error
}

func (fa *FileActionError) Error() string {
	return fa.Err.Error()
}

func (fa *FileActionError) Unwrap() error {
	return fa.Err
}

func rename(oldPath, newPath string) error {
	if _, err := os.Stat(oldPath); os.IsNotExist(err) {
		return &FileActionError{
			FilePaths: []string{oldPath},
			Err:       TranslateErrorf("%s not found", path.Base(oldPath)),
		}
	}
	if _, err := os.Stat(newPath); !os.IsNotExist(err) {
		return &FileActionError{
			FilePaths: []string{oldPath, newPath},
			Err:       TranslateErrorf("%s already exists", path.Base(newPath)),
		}
	}
	err := os.Rename(oldPath, newPath)
	if err != nil {
		return &FileActionError{
			FilePaths: []string{oldPath, newPath},
			Err:       err,
		}
	}
	return nil
}

type RenameAction struct {
	OldPath string
	NewPath string
}

func (ra *RenameAction) Do() error {
	return rename(ra.OldPath, ra.NewPath)
}

func (ra *RenameAction) Undo() error {
	return rename(ra.NewPath, ra.OldPath)
}
