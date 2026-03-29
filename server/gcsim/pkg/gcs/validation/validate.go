package validation

import (
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/keys"
)

func ValidateCharParamKeys(c keys.Char, a action.Action, keys []string) error {
	f, ok := charValidParamKeys[c]
	if !ok {
		// all is ok if no validation function registered
		return nil
	}
	return f(a, keys)
}
