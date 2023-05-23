<template>
  <div>
    <h1>Cats</h1>
    <ul>
      <li v-for="c in cats?.cats" :key="c.id">
        ID: {{ c.id }}, Name: {{ c.name }}, Age: {{ c.age }}
      </li>
    </ul>
    <form @submit.prevent="onSubmit">
      <div class="form-field">
        <label for="name">Name: </label>
        <input type="text" id="name" v-model="newCat.name" required />
      </div>
      <div class="form-field">
        <label for="age">Age:</label>
        <div v-html="'&nbsp;&nbsp;&nbsp;'"></div>
        <input type="number" id="age" v-model="newCat.age" required />
      </div>
      <button type="submit">Create Cat</button>
    </form>
    <div v-if="subLoading">
      <h2>Graphql subscription success: waiting message...</h2>
    </div>
    <div v-else-if="subError">Error: {{ subError }}</div>
    <div v-else-if="subData && subData.catCreated" class="new-cat">
      <h2>
        GraphQL Message Received:<br />
        New cat created: {{ subData.catCreated?.name }} ({{
          subData.catCreated?.age
        }}
        years old)
      </h2>
    </div>
  </div>
</template>

<style>
.form-field {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.form-field label {
  margin-right: 1em;
}
</style>

<script>
import { useQuery, useMutation, useSubscription } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { ref, watch } from 'vue';

export default {
  setup() {
    // Define the graphql queries, mutation and subscription
    const GET_CATS = gql`
      query getCats {
        cats {
          id
          name
          age
        }
      }
    `;

    const CREATE_CAT = gql`
      mutation createCat($createCatInput: CreateCatInput!) {
        createCat(createCatInput: $createCatInput) {
          id
          name
          age
        }
      }
    `;

    const CAT_CREATED = gql`
      subscription catCreated {
        catCreated {
          id
          name
          age
        }
      }
    `;

    // Define the reactive variables
    const {
      loading: subLoading,
      error: subError,
      result: subData,
    } = useSubscription(CAT_CREATED);
    const { result: cats, refetch: refetchCats } = useQuery(GET_CATS);
    const { mutate: createCat } = useMutation(CREATE_CAT);

    const newCat = ref({ name: '', age: null });

    // Define the methods
    const onSubmit = () => {
      createCat({ createCatInput: newCat.value });
      newCat.value = { name: '', age: null };
    };

    // Watch for changes in subData and call handleCatCreated() whenever it changes
    watch(subData, () => {
      if (subData && subData.value) {
        refetchCats();
      }
    });

    // Return the reactive variables and methods
    return { subLoading, subError, subData, cats, newCat, onSubmit };
  },
};
</script>
