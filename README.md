# G2GML

G2GML: Semantic Graph to Property Graph Mapping Language

# Example of G2GML

```
PREFIX icgc : <http://icgc.link/vocab/>
PREFIX faldo: <http://biohackathon.org/resource/faldo>

nodes:
  donor:
    type:   <S rdfs:type icgc:donor>
    age:    <S icgc:age O>
    gender: <S icgc:gender O>
  mutation:
    type:   <S rdfs:type icgc:mutation>
    start_position:
      <S faldo:region ?r> . <?r faldo:begin ?b> . <?b faldo:position O>

edges:
  has_mutation (donor, mutation):
    <?det icgc:donor ?donor> . <?det icgc:mutation ?mutation>
```
