import { useState, useEffect } from 'react'
import axios from 'axios'
import personService from './services/persons'
import Notification from './components/Notification'
import { create } from '../../puhelinluettelo-backend/models/person'

const RenderNumbers = ({ personsToShow, removePerson }) => {
  return (
    <div>
      {personsToShow.map(person => <li key={person.id}>{person.name} {person.number} <button onClick={() => removePerson(person.id)}>delete</button></li>)}
    </div>
  )
}

const Filter = ({ showFiltered, onChange }) => {
  return (
    <div>
      filter shown with <input value={showFiltered} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

const PersonForm = ({ addName, newName, handleNameChange, newNumber, handleNumberChange }) => {
  return (
    <form onSubmit={addName}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [showFiltered, setShowFiltered] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])

  const addName = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber
    }
    if (existingPerson(newName)) {
      if (confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        personService
          .update(existingPerson(newName).id, personObject)
          .then(response => {
            setPersons(persons.map(person => person.id !== existingPerson(newName).id ? person : response.data))
            setNewName('')
            setNewNumber('')
            setNotificationMessage(`Updated number of ${personObject.name}`)
          })

      }
    } else {
      personService
        .create(personObject)
        .then(createdPerson => {
          setPersons(persons.concat(createdPerson))
          setNewName('')
          setNewNumber('')
          setNotificationMessage(`Added ${personObject.name}`)
          setTimeout(() => {
            setNotificationMessage(null)
          }, 5000)
        })
        .catch(error => {
          setNotificationMessage(error.response.data.error)
          setTimeout(() => {
            setNotificationMessage(null)
          }, 5000)
        })
    }
  }

  const removePerson = (id) => {
    const person = persons.find(p => p.id === id)
    personService
      .remove(id, person.name)
      .then(() => {
        setPersons(persons.filter(person => person.id !== id))
        setNotificationMessage(`Deleted ${person.name}`)
        setTimeout(() => {
          setNotificationMessage(null)
        }, 5000)
      })
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = event => {
    setNewNumber(event.target.value)
  }

  const existingPerson = (name) => {
    return persons.find(person => person.name === name)
  }

  const personsToShow = showFiltered
    ? persons.filter(person => person.name.toLowerCase().includes(showFiltered.toLowerCase()))
    : persons

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notificationMessage} />
      <Filter showFiltered={showFiltered} onChange={setShowFiltered} />
      <h2>Add a new</h2>
      <PersonForm
        addName={addName}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange} />
      <h2>Numbers</h2>
      <RenderNumbers personsToShow={personsToShow} removePerson={removePerson} />
    </div>
  )

}

export default App